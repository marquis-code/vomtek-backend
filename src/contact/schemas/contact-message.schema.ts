import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ContactMessageDocument = HydratedDocument<ContactMessage>

export const CONTACT_STATUSES = ['new', 'read', 'replied', 'archived'] as const

@Schema({ timestamps: true, collection: 'contact_messages' })
export class ContactMessage {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, index: true })
  email: string

  @Prop()
  phone: string

  @Prop()
  company: string

  @Prop({ required: true, index: true })
  subject: string

  @Prop({ required: true, maxlength: 8000 })
  message: string

  @Prop({ default: 'contact', index: true })
  source: string

  @Prop({ enum: CONTACT_STATUSES, default: 'new', index: true })
  status: string

  @Prop({ enum: ['low', 'normal', 'high', 'urgent'], default: 'normal', index: true })
  priority: string

  @Prop({ type: Object })
  assignedTo: { id?: string, name?: string, email?: string }

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: [{ text: String, author: String, at: Date }], default: [] })
  internalNotes: { text: string, author: string, at: Date }[]

  @Prop({ type: Date })
  repliedAt: Date

  @Prop({ type: Object })
  meta: Record<string, unknown>

  createdAt: Date
  updatedAt: Date
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage)
ContactMessageSchema.index({ createdAt: -1 })
