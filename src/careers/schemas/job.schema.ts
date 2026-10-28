import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type JobDocument = HydratedDocument<Job>

@Schema({ timestamps: true, collection: 'jobs' })
export class Job {
  @Prop({ required: true, unique: true, index: true })
  slug: string

  @Prop({ required: true })
  title: string

  @Prop({ required: true, index: true })
  division: string

  @Prop({ default: 'Houston, TX' })
  location: string

  @Prop({ default: 'Full-time' })
  type: string

  @Prop({ default: 'Experienced' })
  level: string

  @Prop({ required: true })
  summary: string

  @Prop({ type: [String], default: [] })
  responsibilities: string[]

  @Prop({ type: [String], default: [] })
  requirements: string[]

  @Prop({ type: [String], default: [] })
  niceToHave: string[]

  @Prop({ required: true })
  postedAt: string

  @Prop({ default: true, index: true })
  active: boolean

  createdAt: Date
  updatedAt: Date
}

export const JobSchema = SchemaFactory.createForClass(Job)

export type ApplicationDocument = HydratedDocument<Application>

@Schema({ timestamps: true, collection: 'applications' })
export class Application {
  @Prop({ required: true, index: true })
  jobSlug: string

  @Prop({ required: true })
  jobTitle: string

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, index: true })
  email: string

  @Prop()
  phone: string

  @Prop()
  location: string

  @Prop()
  linkedin: string

  @Prop({ required: true })
  resumeUrl: string

  @Prop({ required: true, maxlength: 8000 })
  coverLetter: string

  @Prop({ enum: ['new', 'reviewing', 'interview', 'offer', 'hired', 'rejected'], default: 'new', index: true })
  status: string

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number

  @Prop({ type: Object })
  assignedTo: { id?: string, name?: string, email?: string }

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: [{ text: String, author: String, at: Date }], default: [] })
  internalNotes: { text: string, author: string, at: Date }[]

  @Prop({ type: Object })
  meta: Record<string, unknown>

  createdAt: Date
  updatedAt: Date
}

export const ApplicationSchema = SchemaFactory.createForClass(Application)
ApplicationSchema.index({ createdAt: -1 })
