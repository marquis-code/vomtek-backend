import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AnalyticsService } from './analytics.service'
import { CreateEventDto } from './dto/create-event.dto'

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  @HttpCode(202)
  @Throttle({ default: { limit: 90, ttl: 60_000 } })
  @ApiOperation({ summary: 'Record a first-party funnel event' })
  async record(@Body() dto: CreateEventDto) {
    return await this.analytics.record(dto)
  }
}
