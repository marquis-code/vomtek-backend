import { Body, Controller, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthUser, CurrentUser, Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { QuotesService } from './quotes.service'
import { AddQuoteNoteDto, UpdateQuoteDto, UpdateQuoteStatusDto } from './dto/create-quote.dto'

@ApiTags('admin-quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales', 'ops')
@Controller('admin/quotes')
export class AdminQuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return await this.quotes.adminList({
      status,
      priority,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      sort,
    })
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="vomtek-quotes.csv"')
  async export(@Res() res: Response) {
    const csv = await this.quotes.exportCsv()
    res.send(csv)
  }

  @Get(':ref')
  async detail(@Param('ref') ref: string) {
    return await this.quotes.adminDetail(ref)
  }

  @Patch(':ref')
  async update(@Param('ref') ref: string, @Body() dto: UpdateQuoteDto, @CurrentUser() user: AuthUser) {
    return await this.quotes.updateLead(ref, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Patch(':ref/status')
  async updateStatus(@Param('ref') ref: string, @Body() dto: UpdateQuoteStatusDto, @CurrentUser() user: AuthUser) {
    return await this.quotes.updateStatus(ref, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Post(':ref/notes')
  async addNote(@Param('ref') ref: string, @Body() dto: AddQuoteNoteDto, @CurrentUser() user: AuthUser) {
    return await this.quotes.addNote(ref, dto, { id: user.id, email: user.email, name: user.name })
  }
}
