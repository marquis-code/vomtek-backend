import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SubscribeDto } from './dto/subscribe.dto'
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema'

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Subscriber.name) private readonly model: Model<SubscriberDocument>,
  ) {}

  async subscribe(dto: SubscribeDto) {
    const email = dto.email.toLowerCase().trim()
    await this.model.findOneAndUpdate(
      { email },
      { $set: { source: dto.source || 'footer', status: 'active' }, $setOnInsert: { email } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    return { ok: true }
  }

  async adminList() {
    const items = await this.model.find().sort({ createdAt: -1 }).limit(500).lean()
    return { items, total: items.length }
  }

  async updateStatus(id: string, status: 'active' | 'unsubscribed') {
    const updated = await this.model.findByIdAndUpdate(id, { status }, { new: true }).lean()
    return { ok: !!updated }
  }

  async exportCsv(): Promise<string> {
    const items = await this.model.find().sort({ createdAt: -1 }).lean()
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const header = 'createdAt,email,source,status'
    const rows = items.map(s => [s.createdAt?.toISOString(), s.email, s.source, s.status].map(escape).join(','))
    return [header, ...rows].join('\n')
  }
}
