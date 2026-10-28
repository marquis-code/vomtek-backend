import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'

export class CreateSystemDto {
  @ApiProperty()
  @IsString()
  @Length(2, 80)
  name: string

  @ApiProperty()
  @IsString()
  @Length(2, 120)
  summary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceFrom?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  priceUnit?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  leadTime?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  image?: string

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  specs?: { label: string, value: string }[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number
}

export class UpdateSystemDto extends PartialType(CreateSystemDto) {}
