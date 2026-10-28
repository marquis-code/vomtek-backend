import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    const readyState = this.connection.readyState
    return {
      status: readyState === 1 ? 'ok' : 'degraded',
      service: 'vomtek-api',
      db: ['disconnected', 'connected', 'connecting', 'disconnecting'][readyState] ?? 'unknown',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    }
  }
}
