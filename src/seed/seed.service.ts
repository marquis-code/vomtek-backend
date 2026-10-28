import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Article, ArticleDocument } from '../insights/schemas/article.schema'
import { Job, JobDocument } from '../careers/schemas/job.schema'
import { Quote, QuoteDocument } from '../quotes/schemas/quote.schema'
import { User, UserDocument } from '../auth/schemas/user.schema'
import { SiteSettings, SiteSettingsDocument } from '../settings/schemas/site-settings.schema'
import { StandardSystem, StandardSystemDocument } from '../catalog/schemas/standard-system.schema'
import { MediaAsset, MediaAssetDocument } from '../media/schemas/media-asset.schema'
import { SITE_DEFAULTS } from '../settings/settings.defaults'
import * as bcrypt from 'bcryptjs'

interface SeedPayload {
  articles: Record<string, unknown>[]
  jobs: Record<string, unknown>[]
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SiteSettings.name) private readonly settingsModel: Model<SiteSettingsDocument>,
    @InjectModel(StandardSystem.name) private readonly systemModel: Model<StandardSystemDocument>,
    @InjectModel(MediaAsset.name) private readonly mediaModel: Model<MediaAssetDocument>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.config.get<string>('SEED_ON_BOOT') !== 'true') return
    try {
      await this.run(false)
    }
    catch (error) {
      this.logger.error(`Seed skipped: ${(error as Error).message}`)
    }
  }

  async run(verbose = true) {
    const payload = this.loadPayload()
    let jobs = 0
    let articles = 0
    let demo = false
    let owner = false
    let systems = 0
    let media = 0

    for (const job of payload.jobs) {
      await this.jobModel.updateOne({ slug: job.slug }, { $set: job }, { upsert: true })
      jobs += 1
    }

    for (const article of payload.articles) {
      await this.articleModel.updateOne({ slug: article.slug }, { $set: article }, { upsert: true })
      articles += 1
    }

    const defaults = JSON.parse(JSON.stringify(SITE_DEFAULTS)) as Record<string, any>
    const existingSettings = await this.settingsModel.findOne({ key: 'site' })
    if (!existingSettings) {
      await this.settingsModel.create({ key: 'site', data: defaults, revision: 1, updatedBy: 'seed' })
    }
    else {
      // Migrate settings documents created by older builds: fill new sections and
      // repair top-level arrays that an old ValidationPipe stripped to empty objects.
      const data = (existingSettings.data ?? {}) as Record<string, any>
      let changed = false
      for (const key of Object.keys(defaults)) {
        if (data[key] === undefined) {
          data[key] = defaults[key]
          changed = true
        }
      }
      for (const key of ['stats', 'plans']) {
        const value = data[key]
        const broken = !Array.isArray(value) || value.some((item: unknown) => !item || typeof item !== 'object' || Object.keys(item as object).length === 0)
        if (broken) {
          data[key] = defaults[key]
          changed = true
        }
      }
      if (changed) {
        existingSettings.data = data
        existingSettings.markModified('data')
        existingSettings.updatedBy = 'seed:migration'
        await existingSettings.save()
      }
    }

    if (await this.userModel.countDocuments() === 0) {
      await this.userModel.create({
        email: (this.config.get<string>('ADMIN_EMAIL') || 'admin@vomtek.com').toLowerCase(),
        name: 'Vomtek Owner',
        role: 'owner',
        passwordHash: await bcrypt.hash(this.config.get<string>('ADMIN_PASSWORD') || 'VomtekAdmin!2026', 12),
        active: true,
        mustChangePassword: false,
      })
      owner = true
    }

    const mediaSeed = [
      ['panel-line', 'Rows of industrial control enclosures on a production line', 'Pexels', 'Assembly'],
      ['electrician-meter', 'Electrician testing voltage inside a control enclosure with a multimeter', 'Pexels', 'Testing'],
      ['laser-cutting', 'Laser cutting a sheet metal panel', 'Cemrecan Yurtman / Pexels', 'Fabrication'],
      ['control-room', 'Control room operator monitoring SCADA screens', 'Sergey Sergeev / Pexels', 'Commissioning'],
      ['water-treatment', 'Aerial view of a water treatment facility', 'Giant Asparagus / Pexels', 'Infrastructure'],
      ['cnc-machinist', 'Machinist setting up a CNC machine', 'Sergey Sergeev / Pexels', 'Machining'],
      ['machine-team', 'Two technicians operating a CNC machine', 'Sergey Sergeev / Pexels', 'People'],
      ['welder-dark', 'Welder working in an industrial shop', 'Abdo Alshreef / Pexels', 'Fabrication'],
      ['fabrication-sparks', 'Worker cutting steel with an angle grinder', 'Laura Alessia / Pexels', 'Fabrication'],
      ['power-grid', 'Pole-mounted distribution transformers against a clear sky', 'Connor Scott McManus / Pexels', 'Power'],
      ['panel-assembly', 'Vomtek control panel interior', 'Vomtek', 'Vomtek'],
      ['motor-rewind', 'Technician rewinding a large motor', 'Vomtek', 'Vomtek'],
      ['houston-office', 'Vomtek office building in Houston', 'Vomtek', 'Vomtek'],
      ['machining', 'Machinist working at a vertical mill', 'Vomtek archive', 'Vomtek'],
    ] as const
    for (const [key, alt, credit, tag] of mediaSeed) {
      await this.mediaModel.updateOne(
        { key },
        { $set: { key, alt, credit, tags: [tag], kind: 'bundled' } },
        { upsert: true },
      )
      media += 1
    }

    const systemsSeed = [
      {
        slug: 'mcc-retrofit-line',
        name: 'MCC Retrofit Line',
        category: 'Motor control',
        summary: 'A pre-engineered motor control center section for plants replacing an aging lineup without a long shutdown.',
        description: 'Built around standard bucket configurations, staged cutover, and a documented FAT. Sized from 6 to 12 sections with options for VFDs, feeders, and PLC control.',
        priceFrom: 18500,
        priceUnit: 'per section',
        leadTime: '6–8 weeks',
        image: 'panel-line',
        specs: [
          { label: 'Voltage', value: '480V / 3Φ' },
          { label: 'Enclosure', value: 'NEMA 12 or 4X' },
          { label: 'Certification', value: 'UL 508A' },
          { label: 'Sections', value: '6–12' },
        ],
        includes: ['Load list review', 'Standard bucket layouts', 'Staged cutover plan', 'Documented FAT', 'As-built drawings'],
        featured: true,
        active: true,
        order: 1,
      },
      {
        slug: 'vfd-pump-panel',
        name: 'VFD Pump Panel',
        category: 'Drives',
        summary: 'A fixed-scope drive panel for pumps and fans, built around the motor rather than a catalog box.',
        description: 'Includes drive, bypass, reactors, cooling, and a local HMI. Options for lead/lag pump control, level transmitters, and remote SCADA I/O.',
        priceFrom: 8500,
        priceUnit: 'per panel',
        leadTime: '4–6 weeks',
        image: 'water-treatment',
        specs: [
          { label: 'Voltage', value: '480V / 3Φ' },
          { label: 'Enclosure', value: 'NEMA 12 or 4X' },
          { label: 'Drive', value: 'VFD with bypass' },
          { label: 'Controls', value: 'Local HMI / SCADA ready' },
        ],
        includes: ['Pump curve review', 'Drive sizing', 'Bypass & reactors', 'FAT', 'Startup support'],
        featured: true,
        active: true,
        order: 2,
      },
      {
        slug: 'plc-control-skid',
        name: 'PLC Control Skid',
        category: 'Automation',
        summary: 'A packaged PLC, HMI, and I/O skid for process equipment that needs to arrive tested and ready to connect.',
        description: 'Includes enclosure, backplate, PLC, HMI, network switch, power distribution, and terminal marshalling. Designed and FAT-tested before it leaves the shop.',
        priceFrom: 24500,
        priceUnit: 'per skid',
        leadTime: '6–9 weeks',
        image: 'control-room',
        specs: [
          { label: 'Controls', value: 'PLC · HMI · I/O' },
          { label: 'Network', value: 'Ethernet/IP · Modbus' },
          { label: 'Enclosure', value: 'NEMA 12' },
          { label: 'Documentation', value: 'As-built + FAT report' },
        ],
        includes: ['Sequence review', 'I/O list & layout', 'PLC/HMI programming', 'FAT', 'Commissioning'],
        featured: false,
        active: true,
        order: 3,
      },
    ]
    for (const system of systemsSeed) {
      await this.systemModel.updateOne({ slug: system.slug }, { $set: system }, { upsert: true })
      systems += 1
    }

    await this.quoteModel.updateOne(
      { ref: 'VT-2026-0042' },
      { $set: { priority: 'high', value: 184000, tags: ['water', 'mcc', 'retrofit'], assignedTo: { name: 'Vomtek Sales', email: 'support@vomtek.com' }, internalNotes: [{ text: 'Customer has partial drawings. Site survey scheduled before design release.', author: 'Vomtek Sales', at: new Date(Date.now() - 20 * 86400_000) }], landingPage: '/quote', referrer: 'https://vomtek.com/services/control-panels' } },
    )

    const existingDemo = await this.quoteModel.exists({ ref: 'VT-2026-0042' })
    if (!existingDemo) {
      const day = 86400_000
      const now = Date.now()
      await this.quoteModel.create({
        ref: 'VT-2026-0042',
        status: 'in_build',
        projectType: 'control-panel',
        projectTypeLabel: 'Control panel',
        industry: 'Water & wastewater',
        panelTypes: ['Motor control center', 'Motor control panel'],
        quantity: 14,
        voltage: '480V / 3Φ',
        environment: 'Indoor, washdown',
        certifications: ['UL 508A'],
        timeline: 'Within 4 weeks',
        services: ['field-service'],
        existingDrawings: 'Partial / hand sketches',
        notes: 'Demo project: replacement MCC lineup for a municipal water treatment plant, staged around a 12-hour shutdown window.',
        name: 'Demo project — Water Treatment Retrofit',
        company: 'Demo Utility',
        email: 'demo@vomtek.com',
        phone: '713-555-0142',
        consent: true,
        source: 'seed',
        estimate: { leadTime: '6–8 weeks', reviewBy: 'Confirmed', confidence: 'Indicative — confirmed after engineering review' },
        timelineEvents: [
          { status: 'received', note: 'Request received through the project configurator.', at: new Date(now - 29 * day) },
          { status: 'engineering_review', note: 'Load list reviewed; site survey scheduled for the existing lineup.', at: new Date(now - 27 * day) },
          { status: 'quoted', note: 'Scope and estimate issued — 14 buckets, staged cutover, UL 508A panel build.', at: new Date(now - 22 * day) },
          { status: 'approved', note: 'Purchase order received. Drawings released for construction.', at: new Date(now - 16 * day) },
          { status: 'in_build', note: 'Enclosure fabricated; backplate layout released to the panel bench. FAT scheduled.', at: new Date(now - 4 * day) },
        ],
        priority: 'high',
        value: 184000,
        assignedTo: { name: 'Vomtek Sales', email: 'support@vomtek.com' },
        tags: ['water', 'mcc', 'retrofit'],
        followUpAt: new Date(Date.now() + 2 * 86400_000),
        internalNotes: [
          { text: 'Customer has partial drawings. Site survey scheduled before design release.', author: 'Vomtek Sales', at: new Date(Date.now() - 20 * 86400_000) },
        ],
        meta: { seeded: true },
      })
      demo = true
    }

    if (verbose) {
      this.logger.log(`Seeded ${jobs} jobs, ${articles} field notes, ${systems} systems, ${media} media assets, owner ${owner ? 'created' : 'present'}, demo project ${demo ? 'created' : 'present'}`)
    }
    return { jobs, articles, systems, media, demo, owner }
  }

  private loadPayload(): SeedPayload {
    const candidates = [
      this.config.get<string>('SEED_CONTENT_PATH'),
      resolve(process.cwd(), 'data/seed.json'),
      resolve(process.cwd(), '../../apps/web/data/seed.json'),
      resolve(process.cwd(), 'apps/web/data/seed.json'),
      resolve(__dirname, '../../data/seed.json'),
      resolve(__dirname, '../../../../apps/web/data/seed.json'),
      resolve(__dirname, '../../../web/data/seed.json'),
    ].filter((candidate): candidate is string => Boolean(candidate))

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        const parsed = JSON.parse(readFileSync(candidate, 'utf8')) as SeedPayload
        if (!Array.isArray(parsed.articles) || !Array.isArray(parsed.jobs)) {
          throw new Error(`Seed file at ${candidate} is missing articles/jobs arrays`)
        }
        this.logger.log(`Loading editorial seed from ${candidate}`)
        return parsed
      }
    }

    throw new Error('Could not find data/seed.json. Set SEED_CONTENT_PATH explicitly.')
  }
}
