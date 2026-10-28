import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request } from 'express'
import { CreateQuoteDto } from './dto/create-quote.dto'
import { QuotesService } from './quotes.service'

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Post()
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit a project request and receive a trackable reference' })
  async create(@Body() dto: CreateQuoteDto, @Req() request: Request) {
    const meta = {
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
    }
    return await this.quotes.create(dto, meta)
  }

  @Get(':ref')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Look up a project by reference (public, no contact details)' })
  async track(@Param('ref') ref: string) {
    return await this.quotes.findByRef(ref)
  }
}
