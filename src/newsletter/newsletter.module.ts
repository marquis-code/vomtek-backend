import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NewsletterController } from './newsletter.controller'
import { AdminNewsletterController } from './admin-newsletter.controller'
import { NewsletterService } from './newsletter.service'
import { Subscriber, SubscriberSchema } from './schemas/subscriber.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Subscriber.name, schema: SubscriberSchema }])],
  controllers: [NewsletterController, AdminNewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService, MongooseModule],
})
export class NewsletterModule {}
