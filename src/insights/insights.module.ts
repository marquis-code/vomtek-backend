import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { InsightsController } from './insights.controller'
import { AdminInsightsController } from './admin-insights.controller'
import { InsightsService } from './insights.service'
import { Article, ArticleSchema } from './schemas/article.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }])],
  controllers: [InsightsController, AdminInsightsController],
  providers: [InsightsService],
  exports: [InsightsService, MongooseModule],
})
export class InsightsModule {}
