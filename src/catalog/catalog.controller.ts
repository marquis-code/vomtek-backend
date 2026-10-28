import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser, CurrentUser, Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CatalogService } from './catalog.service'
import { CreateSystemDto, UpdateSystemDto } from './dto/system.dto'

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list() {
    return await this.catalog.listPublic()
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return await this.catalog.findBySlug(slug)
  }
}

@ApiTags('admin-catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales')
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list() {
    return await this.catalog.listAdmin()
  }

  @Post()
  async create(@Body() dto: CreateSystemDto, @CurrentUser() user: AuthUser) {
    return await this.catalog.create(dto, { id: user.id, email: user.email, name: user.name })
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSystemDto, @CurrentUser() user: AuthUser) {
    return await this.catalog.update(id, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return await this.catalog.remove(id, { id: user.id, email: user.email, name: user.name })
  }
}
