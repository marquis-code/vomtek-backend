import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MailService } from '../mail/mail.service'
import { AuditService } from '../audit/audit.service'
import { SettingsService } from '../settings/settings.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { AddApplicationNoteDto, CreateJobDto, UpdateApplicationDto, UpdateJobDto } from './dto/job.dto'
import { Application, ApplicationDocument, Job, JobDocument } from './schemas/job.schema'

@Injectable()
export class CareersService {
  private readonly logger = new Logger(CareersService.name)

  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private readonly applicationModel: Model<ApplicationDocument>,
    private readonly mail: MailService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
  ) {}

  async list(division?: string) {
    const filter: Record<string, unknown> = { active: true }
    if (division && division !== 'All') filter.division = division
    const items = await this.jobModel.find(filter).sort({ postedAt: -1 }).lean()
    return { items, total: items.length }
  }

  async findOne(slug: string) {
    const job = await this.jobModel.findOne({ slug, active: true }).lean()
    if (!job) throw new NotFoundException('Role not found')
    return job
  }

  async apply(slug: string, dto: CreateApplicationDto, meta: Record<string, unknown> = {}) {
    const job = await this.jobModel.findOne({ slug, active: true }).lean()
    if (!job) throw new NotFoundException('Role not found')

    if (dto.website) {
      this.logger.warn('Honeypot triggered on job application')
      return { ok: true }
    }

    const application = await this.applicationModel.create({
      jobSlug: job.slug,
      jobTitle: job.title,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone,
      location: dto.location,
      linkedin: dto.linkedin,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter.trim(),
      status: 'new',
      rating: 0,
      tags: [],
      internalNotes: [],
      meta,
    })

    const notifications = await this.settings.getNotificationConfig()
    if (notifications.notifyOnApplication !== false) {
      const recipients = Array.isArray(notifications.recipients)
        ? notifications.recipients.filter((item): item is string => typeof item === 'string')
        : undefined
      void this.mail.notifyTeam(
        `Job application — ${job.title}`,
        [
          `Applicant: ${application.firstName} ${application.lastName} <${application.email}>`,
          `Phone: ${application.phone || '—'}`,
          `Location: ${application.location || '—'}`,
          `Resume: ${application.resumeUrl}`,
          `LinkedIn: ${application.linkedin || '—'}`,
          '',
          application.coverLetter,
        ].join('\n'),
        { job: job.slug, id: String(application._id) },
        recipients?.length ? recipients : undefined,
      )
    }

    return { ok: true, id: String(application._id) }
  }

  // ---------- Jobs (admin) ----------

  async adminJobs() {
    const items = await this.jobModel.find().sort({ active: -1, postedAt: -1 }).lean()
    return { items, total: items.length }
  }

  async createJob(dto: CreateJobDto, actor: { id: string, email: string, name: string }) {
    const slug = await this.uniqueSlug(dto.title)
    const job = await this.jobModel.create({
      ...dto,
      slug,
      postedAt: dto.postedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      active: dto.active ?? true,
    })
    await this.audit.record({
      action: 'job.create',
      entity: 'job',
      entityId: String(job._id),
      summary: `Created role “${job.title}”`,
      actor,
    })
    return job.toObject()
  }

  async updateJob(id: string, dto: UpdateJobDto, actor: { id: string, email: string, name: string }) {
    const update: Record<string, unknown> = { ...dto }
    if (dto.postedAt) update.postedAt = dto.postedAt.slice(0, 10)
    const job = await this.jobModel.findByIdAndUpdate(id, { $set: update }, { new: true })
    if (!job) throw new NotFoundException('Role not found')
    await this.audit.record({
      action: 'job.update',
      entity: 'job',
      entityId: id,
      summary: `Updated role “${job.title}”`,
      actor,
    })
    return job.toObject()
  }

  async removeJob(id: string, actor: { id: string, email: string, name: string }) {
    const job = await this.jobModel.findByIdAndDelete(id)
    if (!job) throw new NotFoundException('Role not found')
    await this.audit.record({
      action: 'job.delete',
      entity: 'job',
      entityId: id,
      summary: `Deleted role “${job.title}”`,
      actor,
    })
    return { ok: true }
  }

  // ---------- Applications (admin) ----------

  async adminListApplications(options: { status?: string, job?: string, q?: string, page?: number, limit?: number }) {
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 25))
    const filter: Record<string, unknown> = {}
    if (options.status && options.status !== 'all') filter.status = options.status
    if (options.job && options.job !== 'all') filter.jobSlug = options.job
    if (options.q) {
      const safe = options.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.$or = [
        { firstName: new RegExp(safe, 'i') },
        { lastName: new RegExp(safe, 'i') },
        { email: new RegExp(safe, 'i') },
        { jobTitle: new RegExp(safe, 'i') },
      ]
    }

    const [items, total] = await Promise.all([
      this.applicationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      this.applicationModel.countDocuments(filter),
    ])
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 }
  }

  async applicationDetail(id: string) {
    const application = await this.applicationModel.findById(id).lean()
    if (!application) throw new NotFoundException('Application not found')
    return application
  }

  async updateApplication(id: string, dto: UpdateApplicationDto, actor: { id: string, email: string, name: string }) {
    const application = await this.applicationModel.findByIdAndUpdate(id, { $set: { ...dto } as Record<string, unknown> }, { new: true }).lean()
    if (!application) throw new NotFoundException('Application not found')
    await this.audit.record({
      action: 'application.update',
      entity: 'application',
      entityId: id,
      summary: `Updated application from ${application.firstName} ${application.lastName}`,
      actor,
      meta: { ...dto } as Record<string, unknown>,
    })
    return application
  }

  async addApplicationNote(id: string, dto: AddApplicationNoteDto, actor: { id: string, email: string, name: string }) {
    const application = await this.applicationModel.findById(id)
    if (!application) throw new NotFoundException('Application not found')
    application.internalNotes.push({ text: dto.text.trim(), author: actor.name || actor.email, at: new Date() })
    await application.save()
    return application.toObject()
  }

  async exportApplicationsCsv(): Promise<string> {
    const items = await this.applicationModel.find().sort({ createdAt: -1 }).limit(5000).lean()
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const header = 'createdAt,status,rating,firstName,lastName,email,phone,location,jobTitle,resumeUrl,linkedin'
    const rows = items.map(a => [a.createdAt?.toISOString(), a.status, a.rating, a.firstName, a.lastName, a.email, a.phone, a.location, a.jobTitle, a.resumeUrl, a.linkedin].map(escape).join(','))
    return [header, ...rows].join('\n')
  }

  async updateApplicationStatus(id: string, status: string) {
    const updated = await this.applicationModel.findByIdAndUpdate(id, { status }, { new: true }).lean()
    return { ok: !!updated }
  }

  private async uniqueSlug(title: string) {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'role'
    let slug = base
    let index = 2
    while (await this.jobModel.exists({ slug })) {
      slug = `${base}-${index}`
      index += 1
    }
    return slug
  }
}
