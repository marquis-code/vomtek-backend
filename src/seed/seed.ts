import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { AppModule } from '../app.module'
import { SeedService } from './seed.service'

async function bootstrap() {
  // The explicit run below is the only seed pass; suppress the boot hook.
  process.env.SEED_ON_BOOT = 'false'
  const logger = new Logger('Seed')
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  })
  try {
    const result = await app.get(SeedService).run(true)
    logger.log(`Seed complete: ${JSON.stringify(result)}`)
  }
  catch (error) {
    logger.error(`Seed failed: ${(error as Error).message}`)
    process.exitCode = 1
  }
  finally {
    await app.close()
  }
}

void bootstrap()
