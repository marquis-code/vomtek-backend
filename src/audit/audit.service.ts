import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuditLog, AuditLogDocument } from './audit-log.schema'

export interface AuditEntry {
  action: string
  entity: string
  entityId?: string
  summary: string
  actor?: { id?: string, email?: string, name?: string }
  meta?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(
    @InjectModel(AuditLog.name) private readonly model: Model<AuditLogDocument>,
  ) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.model.create({
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        summary: entry.summary,
        actor: entry.actor,
        meta: entry.meta,
        ip: entry.ip,
        userAgent: entry.userAgent?.slice(0, 300),
      })
    }
    catch (error) {
      this.logger.warn(`Audit write failed: ${(error as Error).message}`)
    }
  }

  async list(options: { page?: number, limit?: number, entity?: string, q?: string } = {}) {
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 40))
    const filter: Record<string, unknown> = {}
    if (options.entity && options.entity !== 'all') filter.entity = options.entity
    if (options.q) {
      const safe = options.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [{ summary: new RegExp(safe, 'i') }, { action: new RegExp(safe, 'i') }, { 'actor.email': new RegExp(safe, 'i') }]
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      this.model.countDocuments(filter),
    ])
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 }
  }
}
