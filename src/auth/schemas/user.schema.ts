import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { ROLES, Role } from '../auth.constants'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string

  @Prop({ required: true, select: false })
  passwordHash: string

  @Prop({ required: true })
  name: string

  @Prop({ enum: ROLES, default: 'viewer', index: true })
  role: Role

  @Prop({ default: true })
  active: boolean

  @Prop({ default: false })
  mustChangePassword: boolean

  @Prop({ select: false })
  refreshTokenHash: string

  @Prop()
  lastLoginAt: Date

  @Prop()
  invitedBy: string

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
