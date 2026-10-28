import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { QUOTE_STATUSES, QuoteStatus } from '../quote.constants'

export type QuoteDocument = HydratedDocument<Quote>

@Schema({ _id: false })
export class TimelineEntry {
  @Prop({ required: true })
  status: string

  @Prop({ required: true })
  note: string

  @Prop({ required: true, type: Date })
  at: Date
}
export const TimelineSchema = SchemaFactory.createForClass(TimelineEntry)

@Schema({ _id: false })
export class QuoteEstimate {
  @Prop()
  leadTime: string

  @Prop()
  reviewBy: string

  @Prop()
  confidence: string
}
export const EstimateSchema = SchemaFactory.createForClass(QuoteEstimate)

@Schema({ _id: false })
export class InternalNote {
  @Prop({ required: true })
  text: string

  @Prop()
  author: string

  @Prop({ required: true, type: Date })
  at: Date
}
export const InternalNoteSchema = SchemaFactory.createForClass(InternalNote)

@Schema({ timestamps: true, collection: 'quotes' })
export class Quote {
  @Prop({ required: true, unique: true, index: true })
  ref: string

  @Prop({ required: true, enum: QUOTE_STATUSES, default: 'received', index: true })
  status: QuoteStatus

  @Prop({ required: true, index: true })
  projectType: string

  @Prop()
  projectTypeLabel: string

  @Prop()
  industry: string

  @Prop({ type: [String], default: [] })
  panelTypes: string[]

  @Prop({ default: 1, min: 1, max: 999 })
  quantity: number

  @Prop()
  voltage: string

  @Prop()
  environment: string

  @Prop({ type: [String], default: [] })
  certifications: string[]

  @Prop()
  timeline: string

  @Prop({ type: [String], default: [] })
  services: string[]

  @Prop()
  existingDrawings: string

  @Prop({ maxlength: 8000 })
  notes: string

  @Prop({ required: true })
  name: string

  @Prop()
  company: string

  @Prop({ required: true, index: true })
  email: string

  @Prop()
  phone: string

  @Prop({ default: false })
  consent: boolean

  @Prop({ default: 'website' })
  source: string

  @Prop({ enum: ['low', 'normal', 'high', 'urgent'], default: 'normal', index: true })
  priority: string

  @Prop({ default: 0 })
  value: number

  @Prop({ type: Date })
  lastContactAt: Date

  @Prop({ type: Object })
  assignedTo: { id?: string, name?: string, email?: string }

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: [InternalNoteSchema], default: [] })
  internalNotes: InternalNote[]

  @Prop({ type: Date })
  followUpAt: Date

  @Prop()
  lostReason: string

  @Prop()
  catalogSlug: string

  @Prop()
  landingPage: string

  @Prop()
  referrer: string

  @Prop({ type: Object })
  utm: Record<string, string>

  @Prop({ type: EstimateSchema })
  estimate: QuoteEstimate

  @Prop({ type: [TimelineSchema], default: [] })
  timelineEvents: TimelineEntry[]

  @Prop({ type: Object })
  meta: Record<string, unknown>

  createdAt: Date
  updatedAt: Date
}

export const QuoteSchema = SchemaFactory.createForClass(Quote)

QuoteSchema.index({ createdAt: -1 })
QuoteSchema.index({ status: 1, createdAt: -1 })
QuoteSchema.index({ email: 1 })
QuoteSchema.index({ priority: 1, createdAt: -1 })
