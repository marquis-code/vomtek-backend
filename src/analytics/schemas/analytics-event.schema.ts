import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AnalyticsEventDocument = HydratedDocument<AnalyticsEvent>

@Schema({ timestamps: true, collection: 'analytics_events' })
export class AnalyticsEvent {
  @Prop({ required: true, index: true })
  name: string

  @Prop({ default: '/' })
  path: string

  @Prop({ index: true })
  sessionId: string

  @Prop({ type: Object })
  meta: Record<string, unknown>

  createdAt: Date
  updatedAt: Date
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent)
AnalyticsEventSchema.index({ createdAt: -1 })
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 })
