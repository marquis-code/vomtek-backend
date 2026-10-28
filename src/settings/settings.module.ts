import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SiteSettings, SiteSettingsSchema } from './schemas/site-settings.schema'
import { SettingsService } from './settings.service'
import { AdminSettingsController } from './admin-settings.controller'
import { SiteController } from './site.controller'

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: SiteSettings.name, schema: SiteSettingsSchema }])],
  controllers: [SiteController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
