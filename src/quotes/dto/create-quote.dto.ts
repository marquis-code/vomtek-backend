import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { PROJECT_TYPES } from '../quote.constants'

export class CreateQuoteDto {
  @ApiProperty({ enum: PROJECT_TYPES })
  @IsIn(PROJECT_TYPES)
  projectType: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  projectTypeLabel?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  panelTypes?: string[]

  @ApiPropertyOptional({ minimum: 1, maximum: 999 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  quantity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voltage?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  environment?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  certifications?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  timeline?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  services?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  existingDrawings?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  notes?: string

  @ApiProperty()
  @IsString()
  @Length(1, 120)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string

  @ApiProperty()
  @IsEmail()
  @MaxLength(180)
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string

  @ApiProperty()
  @IsBoolean()
  @Equals(true, { message: 'Consent is required to submit a request' })
  consent: boolean

  @ApiPropertyOptional({ description: 'Honeypot — must remain empty' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  catalogSlug?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  landingPage?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  referrer?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  utm?: Record<string, string>
}

export class UpdateQuoteStatusDto {
  @ApiProperty()
  @IsIn(['received', 'engineering_review', 'quoted', 'approved', 'in_build', 'shipped', 'closed', 'cancelled'])
  status: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}

export class UpdateQuoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  assignedTo?: { id?: string, name?: string, email?: string }

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lostReason?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string
}

export class AddQuoteNoteDto {
  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  text: string
}
