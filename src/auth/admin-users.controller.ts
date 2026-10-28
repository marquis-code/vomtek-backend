import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { CreateUserDto, UpdateUserDto } from './dto/auth.dto'
import { AuthUser, CurrentUser, Roles } from './decorators/auth.decorators'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { RolesGuard } from './guards/roles.guard'

@ApiTags('admin-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales', 'ops', 'viewer')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  async list() {
    return await this.auth.listUsers()
  }

  @Post()
  @Roles('owner', 'admin')
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return await this.auth.createUser(dto, { id: user.id, email: user.email, name: user.name })
  }

  @Patch(':id')
  @Roles('owner', 'admin')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return await this.auth.updateUser(id, dto, { id: user.id, email: user.email, name: user.name })
  }
}
