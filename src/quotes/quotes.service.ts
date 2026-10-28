import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MailService } from '../mail/mail.service'
import { SettingsService } from '../settings/settings.service'
import { AuditService } from '../audit/audit.service'
import { AddQuoteNoteDto, CreateQuoteDto, UpdateQuoteDto, UpdateQuoteStatusDto } from './dto/create-quote.dto'
import { Quote, QuoteDocument } from './schemas/quote.schema'
import { ProjectType, QUOTE_STATUSES, QuoteStatus } from './quote.constants'

const STATUS_LABELS: Record<string, string> = {
  received: 'Request received',
  engineering_review: 'Engineering review',
  quoted: 'Quote issued',
  approved: 'Approved for build',
  in_build: 'In build',
  shipped: 'Shipped',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

interface LeadTimeRule { projectType: string, maxQuantity: number, leadTime: string }

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name)

  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    private readonly mail: MailService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateQuoteDto, requestMeta: Record<string, unknown> = {}) {
    const estimate = await this.buildEstimate(dto)
    const ref = await this.generateRef()

    if (dto.website) {
      this.logger.warn(`Honeypot triggered on quote submission (ref ${ref})`)
      return { ref, status: 'received', estimate, receivedAt: new Date().toISOString() }
    }

    const doc = await this.quoteModel.create({
      ref,
      status: 'received',
      priority: 'normal',
      value: 0,
      projectType: dto.projectType,
      projectTypeLabel: dto.projectTypeLabel || this.projectLabel(dto.projectType),
      industry: dto.industry,
      panelTypes: dto.panelTypes ?? [],
      quantity: dto.quantity ?? 1,
      voltage: dto.voltage,
      environment: dto.environment,
      certifications: dto.certifications ?? [],
      timeline: dto.timeline,
      services: dto.services ?? [],
      existingDrawings: dto.existingDrawings,
      notes: dto.notes,
      catalogSlug: dto.catalogSlug,
      name: dto.name.trim(),
      company: dto.company,
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone,
      consent: dto.consent,
      source: dto.source || 'configurator',
      landingPage: dto.landingPage,
      referrer: dto.referrer,
      utm: dto.utm,
      estimate,
      tags: [],
      internalNotes: [],
      timelineEvents: [{
        status: 'received',
        note: `Request received through ${dto.source === 'seed' ? 'the Vomtek pipeline' : 'the project configurator'}.`,
        at: new Date(),
      }],
      meta: requestMeta,
    })

    const notifications = await this.settings.getNotificationConfig()
    if (notifications.notifyOnQuote !== false) {
      void this.mail.notifyTeam(
        `New RFQ ${doc.ref} — ${doc.projectTypeLabel || doc.projectType}`,
        [
          `Reference: ${doc.ref}`,
          `Contact: ${doc.name} <${doc.email}> ${doc.phone || ''}`,
          `Company: ${doc.company || '—'}`,
          `Scope: ${doc.projectTypeLabel || doc.projectType} × ${doc.quantity}`,
          `Industry: ${doc.industry || '—'}`,
          `Timeline: ${doc.timeline || '—'}`,
          `Indicative: ${estimate.leadTime}`,
          '',
          doc.notes || '(no brief supplied)',
        ].join('\n'),
        { ref: doc.ref, projectType: doc.projectType },
        this.recipients(notifications),
      )
    }

    if (notifications.sendCustomerAck !== false) {
      const subject = String(notifications.autoReplySubject || 'We received your request — {{ref}}').replace('{{ref}}', doc.ref)
      const body = String(notifications.autoReplyBody || 'Thanks {{name}}. Your reference is {{ref}}.')
        .replace('{{name}}', doc.name)
        .replace('{{ref}}', doc.ref)
      void this.mail.send({ to: doc.email, subject, text: body })
    }

    return {
      ref: doc.ref,
      status: doc.status,
      estimate,
      receivedAt: doc.createdAt ?? new Date(),
    }
  }

  async findByRef(ref: string) {
    const normalized = String(ref || '').trim().toUpperCase()
    if (!normalized) throw new BadRequestException('A project reference is required')

    const quote = await this.quoteModel.findOne({ ref: normalized }).lean()
    if (!quote) throw new NotFoundException('No project found with that reference')

    return {
      ref: quote.ref,
      status: quote.status,
      projectType: quote.projectType,
      projectTypeLabel: quote.projectTypeLabel,
      industry: quote.industry,
      quantity: quote.quantity,
      estimate: quote.estimate,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      timeline: [...(quote.timelineEvents ?? [])].sort((a, b) => +new Date(a.at) - +new Date(b.at)),
    }
  }

  async adminDetail(ref: string) {
    const quote = await this.quoteModel.findOne({ ref: ref.toUpperCase() }).lean()
    if (!quote) throw new NotFoundException('No project found with that reference')
    return this.normalize(quote)
  }

  async adminList(options: { status?: string, priority?: string, search?: string, page?: number, limit?: number, sort?: string }) {
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.min(200, Math.max(1, Number(options.limit) || 25))
    const filter: Record<string, unknown> = {}

    if (options.status && options.status !== 'all') {
      if (!QUOTE_STATUSES.includes(options.status as QuoteStatus)) throw new BadRequestException('Unknown quote status')
      filter.status = options.status
    }
    if (options.priority && options.priority !== 'all') filter.priority = options.priority
    if (options.search) {
      const safe = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        { ref: new RegExp(safe, 'i') },
        { email: new RegExp(safe, 'i') },
        { company: new RegExp(safe, 'i') },
        { name: new RegExp(safe, 'i') },
        { tags: new RegExp(safe, 'i') },
      ]
    }

    const sort: Record<string, 1 | -1> = options.sort === 'oldest' ? { createdAt: 1 } : options.sort === 'value' ? { value: -1 } : { createdAt: -1 }

    const [items, total] = await Promise.all([
      this.quoteModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      this.quoteModel.countDocuments(filter),
    ])

    return { items: items.map(item => this.normalize(item)), total, page, limit, pages: Math.ceil(total / limit) || 1 }
  }

  async updateLead(ref: string, dto: UpdateQuoteDto, actor: { id: string, email: string, name: string }) {
    const update: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) update[key] = key === 'followUpAt' ? new Date(value as string) : value
    }
    if (!Object.keys(update).length) throw new BadRequestException('Nothing to update')

    const quote = await this.quoteModel.findOneAndUpdate(
      { ref: ref.toUpperCase() },
      { $set: update },
      { new: true },
    )
    if (!quote) throw new NotFoundException('No project found with that reference')

    await this.audit.record({
      action: 'quote.update',
      entity: 'quote',
      entityId: quote.ref,
      summary: `Updated ${quote.ref} (${Object.keys(update).join(', ')})`,
      actor,
      meta: update,
    })

    return await this.adminDetail(quote.ref)
  }

  async updateStatus(ref: string, dto: UpdateQuoteStatusDto, actor?: { id: string, email: string, name: string }) {
    if (!QUOTE_STATUSES.includes(dto.status as QuoteStatus)) throw new BadRequestException('Unknown quote status')
    const quote = await this.quoteModel.findOne({ ref: ref.toUpperCase() })
    if (!quote) throw new NotFoundException('No project found with that reference')

    const from = quote.status
    quote.status = dto.status as QuoteStatus
    quote.lastContactAt = new Date()
    quote.timelineEvents.push({
      status: dto.status,
      note: dto.note?.trim() || `${STATUS_LABELS[dto.status]} — updated by the project team.`,
      at: new Date(),
    })
    await quote.save()

    if (actor) {
      await this.audit.record({
        action: 'quote.status',
        entity: 'quote',
        entityId: quote.ref,
        summary: `Moved ${quote.ref} from ${STATUS_LABELS[from] ?? from} to ${STATUS_LABELS[dto.status] ?? dto.status}`,
        actor,
        meta: { from, to: dto.status, note: dto.note },
      })
    }

    return { ok: true, ref: quote.ref, status: quote.status }
  }

  async addNote(ref: string, dto: AddQuoteNoteDto, actor: { id: string, email: string, name: string }) {
    const quote = await this.quoteModel.findOne({ ref: ref.toUpperCase() })
    if (!quote) throw new NotFoundException('No project found with that reference')
    quote.internalNotes.push({ text: dto.text.trim(), author: actor.name || actor.email, at: new Date() })
    await quote.save()
    await this.audit.record({
      action: 'quote.note',
      entity: 'quote',
      entityId: quote.ref,
      summary: `Added an internal note to ${quote.ref}`,
      actor,
    })
    return await this.adminDetail(quote.ref)
  }

  async exportCsv(): Promise<string> {
    const items = await this.quoteModel.find().sort({ createdAt: -1 }).limit(5000).lean()
    const columns = ['ref', 'createdAt', 'status', 'priority', 'value', 'name', 'company', 'email', 'phone', 'projectType', 'industry', 'quantity', 'timeline', 'estimate.leadTime', 'source', 'tags'] as const
    const escape = (value: unknown) => {
      const text = value === undefined || value === null ? '' : String(value)
      return `"${text.replace(/"/g, '""')}"`
    }
    const header = columns.join(',')
    const rows = items.map((quote) => columns.map((column) => {
      if (column === 'estimate.leadTime') return escape(quote.estimate?.leadTime)
      if (column === 'tags') return escape((quote.tags ?? []).join('|'))
      if (column === 'createdAt') return escape(new Date(quote.createdAt).toISOString())
      return escape((quote as Record<string, unknown>)[column])
    }).join(','))
    return [header, ...rows].join('\n')
  }

  private async generateRef(): Promise<string> {
    const year = new Date().getFullYear()
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = `VT-${year}-${Math.floor(1000 + Math.random() * 9000)}`
      const exists = await this.quoteModel.exists({ ref: candidate })
      if (!exists) return candidate
    }
    return `VT-${year}-${Date.now().toString().slice(-6)}`
  }

  private normalize(quote: Record<string, any>) {
    return {
      ...quote,
      priority: quote.priority ?? 'normal',
      value: quote.value ?? 0,
      tags: quote.tags ?? [],
      panelTypes: quote.panelTypes ?? [],
      certifications: quote.certifications ?? [],
      services: quote.services ?? [],
      internalNotes: quote.internalNotes ?? [],
      timelineEvents: quote.timelineEvents ?? [],
    }
  }

  private projectLabel(type: string): string {
    const labels: Record<ProjectType, string> = {
      'control-panel': 'Control panel',
      'retrofit': 'Retrofit / repair',
      'pcb': 'PCB design',
      'harness': 'Wire harness',
      'motor': 'Motor service',
      'field': 'Field service',
      'multiple': 'Multiple scopes',
      'other': 'Other',
    }
    return labels[type as ProjectType] ?? 'Project'
  }

  private async buildEstimate(dto: CreateQuoteDto) {
    const config = await this.settings.getQuoteConfig()
    const rules = (config.leadTimeRules as LeadTimeRule[] | undefined) ?? []
    const quantity = dto.quantity ?? 1
    const match = rules
      .filter(rule => rule.projectType === dto.projectType && quantity <= Number(rule.maxQuantity))
      .sort((a, b) => Number(a.maxQuantity) - Number(b.maxQuantity))[0]

    return {
      leadTime: match?.leadTime || String(config.defaultLeadTime || 'To be confirmed'),
      reviewBy: this.nextBusinessDay(),
      confidence: 'Indicative — confirmed after engineering review',
      slaHours: Number(config.reviewSlaHours || 24),
    }
  }

  private nextBusinessDay(): string {
    const date = new Date()
    do {
      date.setDate(date.getDate() + 1)
    } while (date.getDay() === 0 || date.getDay() === 6)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  private recipients(config: Record<string, unknown>): string[] | undefined {
    const list = config.recipients
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string' && item.includes('@')) : undefined
  }
}
