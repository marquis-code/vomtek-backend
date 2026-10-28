import { Body, Controller, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthUser, CurrentUser, Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ContactService } from './contact.service'
import { AddContactNoteDto, UpdateContactDto } from './dto/create-contact.dto'

@ApiTags('admin-messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales', 'ops')
@Controller('admin/messages')
export class AdminContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.contact.adminList({
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    })
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="vomtek-messages.csv"')
  async export(@Res() res: Response) {
    res.send(await this.contact.exportCsv())
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return await this.contact.detail(id)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto, @CurrentUser() user: AuthUser) {
    return await this.contact.update(id, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Post(':id/notes')
  async addNote(@Param('id') id: string, @Body() dto: AddContactNoteDto, @CurrentUser() user: AuthUser) {
    return await this.contact.addNote(id, dto, { id: user.id, email: user.email, name: user.name })
  }
}
