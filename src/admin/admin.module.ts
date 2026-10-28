import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { AuthModule } from '../auth/auth.module'
import { Quote, QuoteSchema } from '../quotes/schemas/quote.schema'
import { ContactMessage, ContactMessageSchema } from '../contact/schemas/contact-message.schema'
import { Application, ApplicationSchema, Job, JobSchema } from '../careers/schemas/job.schema'
import { Subscriber, SubscriberSchema } from '../newsletter/schemas/subscriber.schema'
import { AnalyticsEvent, AnalyticsEventSchema } from '../analytics/schemas/analytics-event.schema'

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Quote.name, schema: QuoteSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
