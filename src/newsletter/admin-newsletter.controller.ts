import { Body, Controller, Get, Header, Param, Patch, Res, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { IsIn } from 'class-validator'
import { Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { NewsletterService } from './newsletter.service'

class UpdateSubscriberDto {
  @IsIn(['active', 'unsubscribed'])
  status: 'active' | 'unsubscribed'
}

@ApiTags('admin-newsletter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'sales')
@Controller('admin/subscribers')
export class AdminNewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Get()
  async list() {
    return await this.newsletter.adminList()
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="vomtek-subscribers.csv"')
  async export(@Res() res: Response) {
    res.send(await this.newsletter.exportCsv())
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriberDto) {
    return await this.newsletter.updateStatus(id, dto.status)
  }
}
