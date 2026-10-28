import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request } from 'express'
import { CreateContactDto } from './dto/create-contact.dto'
import { ContactService } from './contact.service'

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Send a message to the Vomtek team' })
  async create(@Body() dto: CreateContactDto, @Req() request: Request) {
    return await this.contact.create(dto, {
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
    })
  }
}
