import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request } from 'express'
import { CareersService } from './careers.service'
import { CreateApplicationDto } from './dto/create-application.dto'

@ApiTags('careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careers: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'List open roles' })
  async list(@Query('division') division?: string) {
    return await this.careers.list(division)
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single role' })
  async findOne(@Param('slug') slug: string) {
    return await this.careers.findOne(slug)
  }

  @Post(':slug/apply')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Apply to a role' })
  async apply(@Param('slug') slug: string, @Body() dto: CreateApplicationDto, @Req() request: Request) {
    return await this.careers.apply(slug, dto, {
      ip: request.ip,
      userAgent: request.headers['user-agent']?.slice(0, 300),
    })
  }
}
