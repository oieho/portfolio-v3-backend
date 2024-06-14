import { IsString, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';

export class LoginDto {
  @ApiProperty({
    description: 'User ID',
    example: 'abcd',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'User password',
    example: 'mypassword123',
  })
  @IsString()
  password: string;
}

export class AuthTokenDto {
  @IsString()
  userId: string;

  @IsString()
  role: string;
}

export class RefreshTokenDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  currentRefreshToken: string;

  @IsDate()
  @IsOptional()
  currentRefreshTokenExp: Date;
}
