import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { MediaService } from './media.service'
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto'

@ApiTags('admin-media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales', 'ops')
@Controller('admin/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  async list() {
    return await this.media.list()
  }

  @Post()
  async create(@Body() dto: CreateMediaDto) {
    return await this.media.create(dto)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return await this.media.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.media.remove(id)
  }
}
