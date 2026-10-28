import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto'
import { MediaAsset, MediaAssetDocument } from './schemas/media-asset.schema'

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaAsset.name) private readonly model: Model<MediaAssetDocument>,
  ) {}

  async list() {
    const items = await this.model.find().sort({ key: 1 }).lean()
    return { items, total: items.length }
  }

  async create(dto: CreateMediaDto) {
    return await this.model.create(dto)
  }

  async update(id: string, dto: UpdateMediaDto) {
    const asset = await this.model.findByIdAndUpdate(id, { $set: dto }, { new: true }).lean()
    if (!asset) throw new NotFoundException('Media asset not found')
    return asset
  }

  async remove(id: string) {
    await this.model.findByIdAndDelete(id)
    return { ok: true }
  }
}
