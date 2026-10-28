import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type ArticleDocument = HydratedDocument<Article>

@Schema({ _id: false })
export class ArticleBlock {
  @Prop({ required: true, enum: ['p', 'h2', 'quote', 'list'] })
  type: string

  @Prop()
  text: string

  @Prop({ type: [String] })
  items: string[]
}
export const ArticleBlockSchema = SchemaFactory.createForClass(ArticleBlock)

@Schema({ timestamps: true, collection: 'articles' })
export class Article {
  @Prop({ required: true, unique: true, index: true })
  slug: string

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  excerpt: string

  @Prop({ required: true, index: true })
  category: string

  @Prop({ default: 5 })
  readingTime: number

  @Prop({ required: true, index: true })
  publishedAt: string

  @Prop({ default: 'Vomtek Engineering' })
  author: string

  @Prop({ default: 'ink' })
  tone: string

  @Prop({ type: [ArticleBlockSchema], default: [] })
  body: ArticleBlock[]

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ default: true, index: true })
  published: boolean

  createdAt: Date
  updatedAt: Date
}

export const ArticleSchema = SchemaFactory.createForClass(Article)
