import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MailService } from '../mail/mail.service'
import { SettingsService } from '../settings/settings.service'
import { AuditService } from '../audit/audit.service'
import { AddContactNoteDto, CreateContactDto, UpdateContactDto } from './dto/create-contact.dto'
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema'

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)

  constructor(
    @InjectModel(ContactMessage.name) private readonly model: Model<ContactMessageDocument>,
    private readonly mail: MailService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateContactDto, meta: Record<string, unknown> = {}) {
    if (dto.website) {
      this.logger.warn('Honeypot triggered on contact form')
      return { ok: true }
    }

    const doc = await this.model.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone,
      company: dto.company,
      subject: dto.subject,
      message: dto.message.trim(),
      source: dto.source || 'contact',
      status: 'new',
      meta,
    })

    const notifications = await this.settings.getNotificationConfig()
    const recipients = Array.isArray(notifications.recipients)
      ? notifications.recipients.filter((item): item is string => typeof item === 'string')
      : undefined

    if (notifications.notifyOnContact !== false) {
      void this.mail.notifyTeam(
        `Website enquiry — ${doc.subject}`,
        [
          `From: ${doc.name} <${doc.email}> ${doc.phone || ''}`,
          `Company: ${doc.company || '—'}`,
          `Source: ${doc.source}`,
          '',
          doc.message,
        ].join('\n'),
        { id: String(doc._id), source: doc.source },
        recipients?.length ? recipients : undefined,
      )
    }

    return { ok: true, id: String(doc._id) }
  }

  async adminList(options: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 25))
    const filter: Record<string, unknown> = {}
    if (options.status && options.status !== 'all') filter.status = options.status

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      this.model.countDocuments(filter),
    ])
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 }
  }

  async detail(id: string) {
    const message = await this.model.findById(id).lean()
    if (!message) throw new NotFoundException('Message not found')
    return message
  }

  async update(id: string, dto: UpdateContactDto, actor: { id: string, email: string, name: string }) {
    const update: Record<string, unknown> = { ...dto }
    if (dto.status === 'replied') update.repliedAt = new Date()
    const message = await this.model.findByIdAndUpdate(id, { $set: update }, { new: true }).lean()
    if (!message) throw new NotFoundException('Message not found')
    await this.audit.record({
      action: 'message.update',
      entity: 'message',
      entityId: id,
      summary: `Updated message from ${message.name}`,
      actor,
      meta: update,
    })
    return message
  }

  async addNote(id: string, dto: AddContactNoteDto, actor: { id: string, email: string, name: string }) {
    const message = await this.model.findById(id)
    if (!message) throw new NotFoundException('Message not found')
    message.internalNotes.push({ text: dto.text.trim(), author: actor.name || actor.email, at: new Date() })
    await message.save()
    return message.toObject()
  }

  async updateStatus(id: string, status: string) {
    const updated = await this.model.findByIdAndUpdate(id, { status }, { new: true }).lean()
    return { ok: !!updated }
  }

  async exportCsv(): Promise<string> {
    const items = await this.model.find().sort({ createdAt: -1 }).limit(5000).lean()
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const header = 'createdAt,status,priority,name,email,phone,company,subject,source,message'
    const rows = items.map(m => [m.createdAt?.toISOString(), m.status, m.priority, m.name, m.email, m.phone, m.company, m.subject, m.source, m.message].map(escape).join(','))
    return [header, ...rows].join('\n')
  }
}
