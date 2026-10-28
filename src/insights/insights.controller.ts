import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { InsightsService } from './insights.service'

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'List published field notes' })
  async list(@Query('category') category?: string) {
    return await this.insights.list(category)
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Read a field note' })
  async findOne(@Param('slug') slug: string) {
    return await this.insights.findOne(slug)
  }
}
