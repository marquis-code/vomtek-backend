import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Roles, CurrentUser, AuthUser } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@ApiTags('admin-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  async get() {
    return await this.settings.getAdminSettings()
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto, @CurrentUser() user: AuthUser) {
    return await this.settings.update(dto, { id: user.id, email: user.email, name: user.name })
  }

  @Post('reset')
  async reset(@Body() dto: UpdateSettingsDto, @CurrentUser() user: AuthUser) {
    return await this.settings.update({ reset: true }, { id: user.id, email: user.email, name: user.name })
  }
}
