import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Job, JobSchema } from '../careers/schemas/job.schema'
import { Article, ArticleSchema } from '../insights/schemas/article.schema'
import { Quote, QuoteSchema } from '../quotes/schemas/quote.schema'
import { User, UserSchema } from '../auth/schemas/user.schema'
import { SiteSettings, SiteSettingsSchema } from '../settings/schemas/site-settings.schema'
import { StandardSystem, StandardSystemSchema } from '../catalog/schemas/standard-system.schema'
import { MediaAsset, MediaAssetSchema } from '../media/schemas/media-asset.schema'
import { SeedService } from './seed.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Quote.name, schema: QuoteSchema },
      { name: User.name, schema: UserSchema },
      { name: SiteSettings.name, schema: SiteSettingsSchema },
      { name: StandardSystem.name, schema: StandardSystemSchema },
      { name: MediaAsset.name, schema: MediaAssetSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
