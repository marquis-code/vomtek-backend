import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @Length(2, 140)
  title: string

  @ApiProperty()
  @IsString()
  @Length(2, 80)
  division: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  location?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  type?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  level?: string

  @ApiProperty()
  @IsString()
  @MaxLength(600)
  summary: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niceToHave?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  postedAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean
}

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class UpdateApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['new', 'reviewing', 'interview', 'offer', 'hired', 'rejected'])
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  assignedTo?: { id?: string, name?: string, email?: string }

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

export class AddApplicationNoteDto {
  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  text: string
}
