import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser, CurrentUser, Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { InsightsService } from './insights.service'
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto'

@ApiTags('admin-insights')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales', 'ops')
@Controller('admin/articles')
export class AdminInsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get()
  async list() {
    return await this.insights.adminList()
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    return await this.insights.adminDetail(slug)
  }

  @Post()
  async create(@Body() dto: CreateArticleDto, @CurrentUser() user: AuthUser) {
    return await this.insights.create(dto, { id: user.id, email: user.email, name: user.name })
  }

  @Patch(':slug')
  async update(@Param('slug') slug: string, @Body() dto: UpdateArticleDto, @CurrentUser() user: AuthUser) {
    return await this.insights.update(slug, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
    return await this.insights.remove(slug, { id: user.id, email: user.email, name: user.name })
  }
}
