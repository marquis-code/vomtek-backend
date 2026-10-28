import { Controller, Get, Header } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SettingsService } from './settings.service'

@ApiTags('site')
@Controller('site')
export class SiteController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  async get() {
    return await this.settings.getPublicSettings()
  }
}
