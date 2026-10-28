import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { NewsletterService } from './newsletter.service'
import { SubscribeDto } from './dto/subscribe.dto'

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @ApiOperation({ summary: 'Subscribe to Field Notes' })
  async subscribe(@Body() dto: SubscribeDto) {
    return await this.newsletter.subscribe(dto)
  }
}
