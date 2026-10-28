import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type MediaAssetDocument = HydratedDocument<MediaAsset>

@Schema({ timestamps: true, collection: 'media_assets' })
export class MediaAsset {
  @Prop({ required: true, unique: true, index: true })
  key: string

  @Prop({ required: true })
  alt: string

  @Prop({ default: '' })
  title: string

  @Prop({ default: '' })
  credit: string

  @Prop({ default: '' })
  sourceUrl: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ default: 'bundled', enum: ['bundled', 'external'] })
  kind: string

  @Prop()
  externalUrl: string

  createdAt: Date
  updatedAt: Date
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset)
