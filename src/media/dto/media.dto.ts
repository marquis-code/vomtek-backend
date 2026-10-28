import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsArray, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class CreateMediaDto {
  @ApiProperty()
  @IsString()
  @Length(2, 80)
  key: string

  @ApiProperty()
  @IsString()
  @Length(2, 300)
  alt: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  credit?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourceUrl?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['bundled', 'external'])
  kind?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  externalUrl?: string
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}
