import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { AuthUser } from '../decorators/auth.decorators'

interface JwtPayload {
  sub: string
  email: string
  name: string
  role: AuthUser['role']
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>()
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

    if (!token) throw new UnauthorizedException('Authentication required')

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token)
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
      return true
    }
    catch {
      throw new UnauthorizedException('Session expired')
    }
  }
}
