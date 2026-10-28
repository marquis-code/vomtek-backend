import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AuditLogDocument = HydratedDocument<AuditLog>

@Schema({ _id: false })
export class AuditActor {
  @Prop()
  id: string

  @Prop()
  email: string

  @Prop()
  name: string
}
export const AuditActorSchema = SchemaFactory.createForClass(AuditActor)

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  action: string

  @Prop({ required: true, index: true })
  entity: string

  @Prop()
  entityId: string

  @Prop({ required: true })
  summary: string

  @Prop({ type: AuditActorSchema })
  actor: AuditActor

  @Prop({ type: Object })
  meta: Record<string, unknown>

  @Prop()
  ip: string

  @Prop()
  userAgent: string

  createdAt: Date
  updatedAt: Date
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)
AuditLogSchema.index({ createdAt: -1 })
