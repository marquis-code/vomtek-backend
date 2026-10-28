import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class SubscribeDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(180)
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['footer', 'insights', 'contact', 'foundation'])
  source?: string
}
