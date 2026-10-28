import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Quote, QuoteSchema } from './schemas/quote.schema'
import { QuotesController } from './quotes.controller'
import { AdminQuotesController } from './admin-quotes.controller'
import { QuotesService } from './quotes.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Quote.name, schema: QuoteSchema }])],
  controllers: [QuotesController, AdminQuotesController],
  providers: [QuotesService],
  exports: [QuotesService, MongooseModule],
})
export class QuotesModule {}
