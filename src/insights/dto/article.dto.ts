import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator'

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  @Length(4, 180)
  title: string

  @ApiProperty()
  @IsString()
  @Length(10, 600)
  excerpt: string

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  category: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  readingTime?: number

  @ApiProperty()
  @IsDateString()
  publishedAt: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  author?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['ink', 'signal', 'bone'])
  tone?: string

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  body?: { type: string, text?: string, items?: string[] }[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
