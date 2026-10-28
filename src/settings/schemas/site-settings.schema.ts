import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type SiteSettingsDocument = HydratedDocument<SiteSettings>

@Schema({ timestamps: true, collection: 'site_settings' })
export class SiteSettings {
  @Prop({ required: true, unique: true, default: 'site' })
  key: string

  @Prop({ type: Object, default: {} })
  data: Record<string, unknown>

  @Prop()
  updatedBy: string

  @Prop()
  revision: number

  createdAt: Date
  updatedAt: Date
}

export const SiteSettingsSchema = SchemaFactory.createForClass(SiteSettings)
