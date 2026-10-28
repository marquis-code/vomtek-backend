import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import { ROLES, Role } from '../auth.constants'

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  password: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty()
  @IsString()
  @Length(10, 200, { message: 'Use at least 10 characters' })
  newPassword: string
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  name: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty({ enum: ROLES })
  @IsIn(ROLES)
  role: Role

  @ApiPropertyOptional({ description: 'Leave blank to generate a temporary password' })
  @IsOptional()
  @IsString()
  @Length(10, 200)
  password?: string
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string

  @ApiPropertyOptional({ enum: ROLES })
  @IsOptional()
  @IsIn(ROLES)
  role?: Role

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean
}
