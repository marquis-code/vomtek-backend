import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type StandardSystemDocument = HydratedDocument<StandardSystem>

@Schema({ _id: false })
export class SystemSpec {
  @Prop() label: string
  @Prop() value: string
}
export const SystemSpecSchema = SchemaFactory.createForClass(SystemSpec)

@Schema({ timestamps: true, collection: 'standard_systems' })
export class StandardSystem {
  @Prop({ required: true, unique: true, index: true })
  slug: string

  @Prop({ required: true })
  name: string

  @Prop({ default: 'Controls' })
  category: string

  @Prop({ required: true })
  summary: string

  @Prop()
  description: string

  @Prop({ default: 0 })
  priceFrom: number

  @Prop({ default: 'per unit' })
  priceUnit: string

  @Prop({ default: '4–6 weeks' })
  leadTime: string

  @Prop({ default: 'control-panels' })
  image: string

  @Prop({ type: [SystemSpecSchema], default: [] })
  specs: SystemSpec[]

  @Prop({ type: [String], default: [] })
  includes: string[]

  @Prop({ default: true, index: true })
  active: boolean

  @Prop({ default: false })
  featured: boolean

  @Prop({ default: 0 })
  order: number

  createdAt: Date
  updatedAt: Date
}

export const StandardSystemSchema = SchemaFactory.createForClass(StandardSystem)
