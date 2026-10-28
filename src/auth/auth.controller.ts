import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { ChangePasswordDto, LoginDto } from './dto/auth.dto'
import { AuthUser, CurrentUser } from './decorators/auth.decorators'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in to the admin console' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.auth.login(dto, req, res)
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Exchange the refresh cookie for a new access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.auth.refresh(req, res)
  }

  @Post('logout')
  @ApiOperation({ summary: 'End the admin session' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.auth.logout(req, res)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Current admin user' })
  async me(@CurrentUser() user: AuthUser) {
    return await this.auth.me(user.id)
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change your own password' })
  async changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return await this.auth.changePassword(user.id, dto)
  }
}
