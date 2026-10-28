import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { HealthModule } from './health/health.module'
import { QuotesModule } from './quotes/quotes.module'
import { ContactModule } from './contact/contact.module'
import { CareersModule } from './careers/careers.module'
import { InsightsModule } from './insights/insights.module'
import { NewsletterModule } from './newsletter/newsletter.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { AdminModule } from './admin/admin.module'
import { SeedModule } from './seed/seed.module'
import { MailModule } from './mail/mail.module'
import { AuditModule } from './audit/audit.module'
import { AuthModule } from './auth/auth.module'
import { SettingsModule } from './settings/settings.module'
import { CatalogModule } from './catalog/catalog.module'
import { MediaModule } from './media/media.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27019/vomtek',
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 20,
      }),
    }),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 120 },
    ]),
    MailModule,
    AuditModule,
    AuthModule,
    SettingsModule,
    CatalogModule,
    MediaModule,
    HealthModule,
    QuotesModule,
    ContactModule,
    CareersModule,
    InsightsModule,
    NewsletterModule,
    AnalyticsModule,
    AdminModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
