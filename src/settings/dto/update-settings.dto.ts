import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

export class StatDto {
  @IsString() value: string
  @IsString() label: string
  @IsOptional() @IsString() note?: string
}

export class PlanDto {
  @IsString() slug: string
  @IsString() name: string
  @IsString() price: string
  @IsString() period: string
  @IsString() description: string
  @IsArray() @IsString({ each: true }) features: string[]
  @IsBoolean() featured: boolean
  @IsString() ctaLabel: string
}

/**
 * Settings are edited section by section in the admin application. Deep
 * validation is handled by the service merge (unknown nested fields are
 * ignored by the UI), while these guards ensure a section is the right shape.
 */
export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  company?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  socials?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  announcement?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  hero?: Record<string, unknown>

  @ApiPropertyOptional({ type: [StatDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats?: StatDto[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  carousel?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  sections?: Record<string, boolean>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  features?: Record<string, boolean>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  quote?: Record<string, unknown>

  @ApiPropertyOptional({ type: [PlanDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanDto)
  plans?: PlanDto[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  seo?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  notifications?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  integrations?: Record<string, unknown>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  divisions?: Record<string, Record<string, unknown>>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  services?: Record<string, Record<string, unknown>>

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reset?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resetSection?: string
}
