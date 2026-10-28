import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Request, Response } from 'express'
import * as bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { User, UserDocument } from './schemas/user.schema'
import { ChangePasswordDto, CreateUserDto, LoginDto, UpdateUserDto } from './dto/auth.dto'
import { Role } from './auth.constants'
import { AuditService } from '../audit/audit.service'

const REFRESH_COOKIE = 'vt_refresh'
const ACCESS_TTL = '15m'
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto, req: Request, res: Response) {
    const email = dto.email.toLowerCase().trim()
    const user = await this.users.findOne({ email, active: true }).select('+passwordHash')
    if (!user) throw new UnauthorizedException('Invalid email or password')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid email or password')

    user.lastLoginAt = new Date()
    await this.setRefreshToken(user, res)
    await this.audit.record({
      action: 'auth.login',
      entity: 'user',
      entityId: String(user._id),
      summary: `${user.email} signed in`,
      actor: { id: String(user._id), email: user.email, name: user.name },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    return {
      accessToken: await this.issueAccess(user),
      user: this.sanitize(user),
    }
  }

  async refresh(req: Request, res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (!raw) throw new UnauthorizedException('No active session')

    const hash = this.hashToken(raw)
    const user = await this.users.findOne({ refreshTokenHash: hash, active: true })
    if (!user) {
      res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
      throw new UnauthorizedException('Session expired')
    }

    await this.setRefreshToken(user, res)
    return { accessToken: await this.issueAccess(user), user: this.sanitize(user) }
  }

  async logout(req: Request, res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (raw) {
      await this.users.updateOne({ refreshTokenHash: this.hashToken(raw) }, { $unset: { refreshTokenHash: 1 } })
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
    return { ok: true }
  }

  async me(userId: string) {
    const user = await this.users.findById(userId)
    if (!user) throw new UnauthorizedException('Account not found')
    return this.sanitize(user)
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.users.findById(userId).select('+passwordHash')
    if (!user) throw new NotFoundException('Account not found')
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) throw new BadRequestException('Current password is incorrect')

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12)
    user.mustChangePassword = false
    await this.users.updateOne({ _id: user._id }, { $unset: { refreshTokenHash: 1 } })
    await user.save()
    return { ok: true }
  }

  async listUsers() {
    const items = await this.users.find().sort({ createdAt: 1 })
    return { items: items.map(user => this.sanitize(user)), total: items.length }
  }

  async createUser(dto: CreateUserDto, actor: { id: string, email: string, name: string }) {
    const email = dto.email.toLowerCase().trim()
    const exists = await this.users.exists({ email })
    if (exists) throw new BadRequestException('A user with that email already exists')

    const temporary = dto.password || this.temporaryPassword()
    const user = await this.users.create({
      email,
      name: dto.name.trim(),
      role: dto.role,
      passwordHash: await bcrypt.hash(temporary, 12),
      mustChangePassword: !dto.password,
      invitedBy: actor.email,
    })

    await this.audit.record({
      action: 'user.create',
      entity: 'user',
      entityId: String(user._id),
      summary: `Invited ${user.email} as ${user.role}`,
      actor,
    })

    return {
      user: this.sanitize(user),
      temporaryPassword: dto.password ? undefined : temporary,
    }
  }

  async updateUser(id: string, dto: UpdateUserDto, actor: { id: string, email: string, name: string }) {
    const user = await this.users.findById(id)
    if (!user) throw new NotFoundException('Account not found')

    if (user.role === 'owner' && ((dto.role && dto.role !== 'owner') || dto.active === false)) {
      const owners = await this.users.countDocuments({ role: 'owner', active: true })
      if (owners <= 1) throw new BadRequestException('At least one active owner is required')
    }

    if (dto.name !== undefined) user.name = dto.name.trim()
    if (dto.role !== undefined) user.role = dto.role
    if (dto.active !== undefined) {
      user.active = dto.active
      if (!dto.active) await this.users.updateOne({ _id: user._id }, { $unset: { refreshTokenHash: 1 } })
    }
    await user.save()

    await this.audit.record({
      action: 'user.update',
      entity: 'user',
      entityId: String(user._id),
      summary: `Updated ${user.email}${dto.role ? ` · role ${dto.role}` : ''}${dto.active === false ? ' · deactivated' : ''}`,
      actor,
    })

    return this.sanitize(user)
  }

  private async issueAccess(user: UserDocument) {
    return await this.jwt.signAsync({
      sub: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role as Role,
    }, { expiresIn: ACCESS_TTL })
  }

  private async setRefreshToken(user: UserDocument, res: Response) {
    const raw = randomBytes(48).toString('base64url')
    user.refreshTokenHash = this.hashToken(raw)
    await user.save()

    res.cookie(REFRESH_COOKIE, raw, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/api/auth',
      maxAge: REFRESH_TTL_MS,
    })
  }

  private hashToken(raw: string) {
    return createHash('sha256').update(raw).digest('hex')
  }

  private temporaryPassword() {
    return `Vt-${randomBytes(5).toString('base64url')}!7`
  }

  private sanitize(user: UserDocument) {
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }
  }
}
