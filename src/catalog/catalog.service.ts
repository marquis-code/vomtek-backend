import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuditService } from '../audit/audit.service'
import { CreateSystemDto, UpdateSystemDto } from './dto/system.dto'
import { StandardSystem, StandardSystemDocument } from './schemas/standard-system.schema'

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(StandardSystem.name) private readonly model: Model<StandardSystemDocument>,
    private readonly audit: AuditService,
  ) {}

  async listPublic() {
    const items = await this.model.find({ active: true }).sort({ featured: -1, order: 1, priceFrom: 1 }).lean()
    return { items, total: items.length }
  }

  async listAdmin() {
    const items = await this.model.find().sort({ featured: -1, order: 1 }).lean()
    return { items, total: items.length }
  }

  async findBySlug(slug: string) {
    const item = await this.model.findOne({ slug, active: true }).lean()
    if (!item) throw new NotFoundException('System not found')
    return item
  }

  async create(dto: CreateSystemDto, actor: { id: string, email: string, name: string }) {
    const slug = this.slugify(dto.name)
    const exists = await this.model.exists({ slug })
    if (exists) throw new BadRequestException('A system with that name already exists')

    const system = await this.model.create({ ...dto, slug })
    await this.audit.record({
      action: 'catalog.create',
      entity: 'catalog',
      entityId: String(system._id),
      summary: `Created standard system “${system.name}”`,
      actor,
    })
    return system
  }

  async update(id: string, dto: UpdateSystemDto, actor: { id: string, email: string, name: string }) {
    const system = await this.model.findByIdAndUpdate(id, { $set: dto }, { new: true })
    if (!system) throw new NotFoundException('System not found')
    await this.audit.record({
      action: 'catalog.update',
      entity: 'catalog',
      entityId: id,
      summary: `Updated standard system “${system.name}”`,
      actor,
    })
    return system
  }

  async remove(id: string, actor: { id: string, email: string, name: string }) {
    const system = await this.model.findByIdAndDelete(id)
    if (!system) throw new NotFoundException('System not found')
    await this.audit.record({
      action: 'catalog.delete',
      entity: 'catalog',
      entityId: id,
      summary: `Deleted standard system “${system.name}”`,
      actor,
    })
    return { ok: true }
  }

  private slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
}
