import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuditService } from '../audit/audit.service'
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto'
import { Article, ArticleDocument } from './schemas/article.schema'

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
    private readonly audit: AuditService,
  ) {}

  async list(category?: string) {
    const filter: Record<string, unknown> = { published: true }
    if (category && category !== 'All') filter.category = category
    const items = await this.articleModel
      .find(filter)
      .select('-body')
      .sort({ publishedAt: -1 })
      .lean()
    return { items, total: items.length }
  }

  async findOne(slug: string) {
    const article = await this.articleModel.findOne({ slug, published: true }).lean()
    if (!article) throw new NotFoundException('Field note not found')
    return article
  }

  async adminList() {
    const items = await this.articleModel.find().sort({ publishedAt: -1 }).lean()
    return { items, total: items.length }
  }

  async adminDetail(slug: string) {
    const article = await this.articleModel.findOne({ slug }).lean()
    if (!article) throw new NotFoundException('Field note not found')
    return article
  }

  async create(dto: CreateArticleDto, actor: { id: string, email: string, name: string }) {
    const slug = await this.uniqueSlug(dto.title)
    const article = await this.articleModel.create({
      ...dto,
      slug,
      publishedAt: dto.publishedAt.slice(0, 10),
      published: dto.published ?? true,
      body: dto.body ?? [],
    })
    await this.audit.record({
      action: 'article.create',
      entity: 'article',
      entityId: String(article._id),
      summary: `Published field note “${article.title}”`,
      actor,
    })
    return article.toObject()
  }

  async update(slug: string, dto: UpdateArticleDto, actor: { id: string, email: string, name: string }) {
    const update: Record<string, unknown> = { ...dto }
    if (dto.publishedAt) update.publishedAt = dto.publishedAt.slice(0, 10)
    const article = await this.articleModel.findOneAndUpdate({ slug }, { $set: update }, { new: true })
    if (!article) throw new NotFoundException('Field note not found')
    await this.audit.record({
      action: 'article.update',
      entity: 'article',
      entityId: slug,
      summary: `Updated field note “${article.title}”`,
      actor,
    })
    return article.toObject()
  }

  async remove(slug: string, actor: { id: string, email: string, name: string }) {
    const article = await this.articleModel.findOneAndDelete({ slug })
    if (!article) throw new NotFoundException('Field note not found')
    await this.audit.record({
      action: 'article.delete',
      entity: 'article',
      entityId: slug,
      summary: `Deleted field note “${article.title}”`,
      actor,
    })
    return { ok: true }
  }

  private async uniqueSlug(title: string) {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'field-note'
    let slug = base
    let index = 2
    while (await this.articleModel.exists({ slug })) {
      slug = `${base}-${index}`
      index += 1
    }
    return slug
  }
}
