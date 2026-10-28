import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateEventDto } from './dto/create-event.dto'
import { AnalyticsEvent, AnalyticsEventDocument } from './schemas/analytics-event.schema'

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(
    @InjectModel(AnalyticsEvent.name) private readonly model: Model<AnalyticsEventDocument>,
  ) {}

  async record(dto: CreateEventDto) {
    // Keep event payloads small and structured; this endpoint is unauthenticated.
    let meta: Record<string, unknown> = {}
    if (dto.meta) {
      const raw = JSON.stringify(dto.meta)
      meta = raw.length <= 4000 ? dto.meta : { truncated: true }
    }
    await this.model.create({
      name: dto.name,
      path: dto.path || '/',
      sessionId: dto.sessionId?.slice(0, 80),
      meta,
    })
    return { ok: true }
  }

  async topEvents(since: Date, limit = 20) {
    return await this.model.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ])
  }

  async dailySessions(days = 14) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return await this.model.aggregate([
      { $match: { createdAt: { $gte: since }, name: 'page_view' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          views: { $sum: 1 },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', views: 1, sessions: { $size: '$sessions' } } },
    ])
  }

  async countSince(since: Date) {
    return await this.model.countDocuments({ createdAt: { $gte: since } })
  }

  async conversionCounts() {
    const [quoteViews, quoteSubmits, contactSubmits] = await Promise.all([
      this.model.countDocuments({ name: 'quote_view' }),
      this.model.countDocuments({ name: 'quote_submit' }),
      this.model.countDocuments({ name: 'contact_submit' }),
    ])
    return { quoteViews, quoteSubmits, contactSubmits }
  }
}
