import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuditService } from '../audit/audit.service'
import { SITE_DEFAULTS } from './settings.defaults'
import { SiteSettings, SiteSettingsDocument } from './schemas/site-settings.schema'
import { UpdateSettingsDto } from './dto/update-settings.dto'

type Dict = Record<string, unknown>

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)
  private cache: { value: Dict, at: number } | null = null

  constructor(
    @InjectModel(SiteSettings.name) private readonly model: Model<SiteSettingsDocument>,
    private readonly audit: AuditService,
  ) {}

  async getAdminSettings(): Promise<Dict> {
    const doc = await this.getDoc()
    return this.merge(this.cloneDefaults(), doc.data)
  }

  /**
   * Public settings never include notification routing, integration secrets or
   * the internal quote rules. Everything here is safe to render on the site.
   */
  async getPublicSettings(): Promise<Dict> {
    const admin = await this.getAdminSettings()
    const publicKeys = ['company', 'socials', 'announcement', 'hero', 'stats', 'carousel', 'sections', 'features', 'plans', 'seo', 'divisions', 'services']
    const data: Dict = {}
    for (const key of publicKeys) data[key] = admin[key]
    return { ...data, generatedAt: new Date().toISOString() }
  }

  async getQuoteConfig(): Promise<Dict> {
    const admin = await this.getAdminSettings()
    return (admin.quote as Dict) ?? {}
  }

  async getNotificationConfig(): Promise<Dict> {
    const admin = await this.getAdminSettings()
    return (admin.notifications as Dict) ?? {}
  }

  async update(dto: UpdateSettingsDto, actor?: { id: string, email: string, name: string }): Promise<Dict> {
    const doc = await this.getDoc()

    if (dto.reset) {
      doc.data = this.cloneDefaults()
      doc.revision = (doc.revision ?? 0) + 1
      doc.updatedBy = actor?.email || 'system'
      doc.markModified('data')
      await doc.save()
      this.cache = null
      await this.audit.record({
        action: 'settings.reset',
        entity: 'settings',
        summary: 'Reset all site settings to defaults',
        actor,
      })
      return this.getAdminSettings()
    }

    const patch: Dict = { ...dto }
    delete (patch as Dict).reset
    delete (patch as Dict).resetSection

    if (dto.resetSection) {
      const defaults = this.cloneDefaults()
      if (!(dto.resetSection in defaults)) throw new BadRequestException('Unknown settings section')
      ;(patch as Dict)[dto.resetSection] = defaults[dto.resetSection]
    }

    this.assertSafe(patch)
    doc.data = this.merge((doc.data ?? {}) as Dict, patch)
    doc.revision = (doc.revision ?? 0) + 1
    doc.updatedBy = actor?.email || 'system'
    doc.markModified('data')
    await doc.save()
    this.cache = null

    const changed = Object.keys(patch).filter(key => key !== 'resetSection')
    await this.audit.record({
      action: 'settings.update',
      entity: 'settings',
      summary: `Updated site settings: ${changed.join(', ')}`,
      actor,
      meta: { sections: changed },
    })

    return this.getAdminSettings()
  }

  private async getDoc(): Promise<SiteSettingsDocument> {
    let doc = await this.model.findOne({ key: 'site' })
    if (!doc) {
      doc = await this.model.create({ key: 'site', data: this.cloneDefaults(), revision: 1, updatedBy: 'system' })
    }
    return doc
  }

  private cloneDefaults(): Dict {
    return JSON.parse(JSON.stringify(SITE_DEFAULTS)) as Dict
  }

  /** Replace arrays, merge objects recursively, reject prototype pollution. */
  private merge(base: Dict, patch: Dict, depth = 0): Dict {
    if (depth > 8) return base
    const output: Dict = { ...base }
    for (const [key, value] of Object.entries(patch)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) continue
      if (value === undefined) continue
      if (Array.isArray(value)) {
        output[key] = JSON.parse(JSON.stringify(value))
      }
      else if (value && typeof value === 'object') {
        const current = output[key]
        output[key] = this.merge(
          current && typeof current === 'object' && !Array.isArray(current) ? current as Dict : {},
          value as Dict,
          depth + 1,
        )
      }
      else {
        output[key] = value
      }
    }
    return output
  }

  private assertSafe(patch: Dict) {
    const serialized = JSON.stringify(patch)
    if (serialized.length > 220_000) {
      throw new BadRequestException('Settings payload is too large')
    }
    if (serialized.includes('__proto__') || serialized.includes('"constructor"') || serialized.includes('"prototype"')) {
      throw new BadRequestException('Invalid settings payload')
    }
  }
}
