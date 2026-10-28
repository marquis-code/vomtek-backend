import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEmail, IsIn, IsObject, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  name: string

  @ApiProperty()
  @IsEmail()
  @MaxLength(180)
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string

  @ApiProperty()
  @IsString()
  @Length(1, 160)
  subject: string

  @ApiProperty()
  @IsString()
  @Length(1, 8000)
  message: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['contact', 'foundation', 'careers', 'general'])
  source?: string

  @ApiPropertyOptional({ description: 'Honeypot — must remain empty' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string
}

export class UpdateContactStatusDto {
  @ApiProperty()
  @IsIn(['new', 'read', 'replied', 'archived'])
  status: string
}

export class UpdateContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  assignedTo?: { id?: string, name?: string, email?: string }

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['new', 'read', 'replied', 'archived'])
  status?: string
}

export class AddContactNoteDto {
  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  text: string
}
