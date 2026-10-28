import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type SubscriberDocument = HydratedDocument<Subscriber>

@Schema({ timestamps: true, collection: 'subscribers' })
export class Subscriber {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ default: 'footer' })
  source: string

  @Prop({ enum: ['active', 'unsubscribed'], default: 'active', index: true })
  status: string

  createdAt: Date
  updatedAt: Date
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber)
