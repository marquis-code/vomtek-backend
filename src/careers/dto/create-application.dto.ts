import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator'

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  @Length(1, 80)
  firstName: string

  @ApiProperty()
  @IsString()
  @Length(1, 80)
  lastName: string

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
  @MaxLength(120)
  location?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  linkedin?: string

  @ApiProperty()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  resumeUrl: string

  @ApiProperty()
  @IsString()
  @Length(10, 8000)
  coverLetter: string

  @ApiPropertyOptional({ description: 'Honeypot — must remain empty' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string
}

export class UpdateApplicationStatusDto {
  @ApiProperty()
  @IsString()
  status: string
}
