import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  IsDateString,
} from 'class-validator';
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
  @ApiProperty({
    description: 'User ID',
    example: 'abcd',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '회원 역할',
    example: 'Member or Admin',
  })
  @IsString()
  role: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'User ID',
    example: 'abcd',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: '리프레시 토큰은 Bearer를 접두사로 사용하지 않음',
  })
  @IsString()
  @IsOptional()
  currentRefreshToken: string;

  @ApiProperty({
    description: '리프레시 토큰 만료 기간',
    example: '2주(default)',
  })
  @IsDate()
  @IsOptional()
  currentRefreshTokenExp: Date;
}
