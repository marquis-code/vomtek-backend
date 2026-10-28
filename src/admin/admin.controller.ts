import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/auth.decorators'
import { AdminService } from './admin.service'
import { AuditService } from '../audit/audit.service'

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales', 'ops', 'viewer')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly audit: AuditService,
  ) {}

  @Get('overview')
  async overview(@Query('days') days?: string) {
    return await this.admin.overview(days ? Math.min(365, Math.max(7, Number(days))) : 30)
  }

  @Get('analytics')
  async analytics(@Query('days') days?: string) {
    return await this.admin.analytics(days ? Math.min(365, Math.max(7, Number(days))) : 30)
  }

  @Get('activity')
  @Roles('owner', 'admin')
  async activity(@Query('limit') limit?: string) {
    return await this.audit.list({ limit: limit ? Number(limit) : 20, page: 1 })
  }
}
