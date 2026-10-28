import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  })

  const config = app.get(ConfigService)
  const port = Number(config.get('PORT') || 4000)
  const origins = (config.get<string>('CORS_ORIGINS') || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
  const httpAdapter = app.getHttpAdapter().getInstance()
  httpAdapter.set('trust proxy', 1)

  app.setGlobalPrefix('api')
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))
  app.use(cookieParser())
  app.enableCors({
    origin: origins.includes('*') ? true : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
  })
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: false,
  }))
  app.enableShutdownHooks()

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vomtek API')
    .setDescription('RFQ pipeline, editorial content, careers, and lead analytics for vomtek.com')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(port, '0.0.0.0')
  // eslint-disable-next-line no-console
  console.log(`Vomtek API listening on http://localhost:${port}/api  (docs: /api/docs)`)
}

void bootstrap()
