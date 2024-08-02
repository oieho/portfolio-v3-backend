import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
  IsAlphanumeric,
  IsEnum,
} from 'class-validator';
import { Model, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field } from '@nestjs/graphql';

export class UserIdAndPasswordDto {
  @IsString()
  @ApiProperty({ description: '사용자ID', default: 'user1' })
  userId: string;

  @IsString()
  @ApiProperty({
    description: '사용자 비밀번호',
    default: 'abCd1234(영문 대소문자 8~20자리)',
  })
  password: string;
}

@ObjectType()
export class IdCheckResultsInEmail {
  @IsString()
  @Field()
  extractedEmail: string;

  @Field()
  existsEmail: boolean;
}

@ObjectType()
export class IdAndEmailCheckSendsEmail {
  @Field()
  @IsString()
  @MaxLength(256)
  token: string;

  @Field()
  sentEmail: boolean;
}

export enum SocialMediaEnum {
  KAKAO = 'K',
  NAVER = 'N',
  GOOGLE = 'G',
  LOCAL = '',
}

export enum RoleEnum {
  MEMBER = 'Member',
  ADMIN = 'Administrator',
}

@ObjectType()
export class UserDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ description: '사용자 ID ', default: 'user1', required: true })
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsAlphanumeric()
  @ApiProperty({
    description: '사용자 비밀번호',
    default: 'abCd1234(영문 대소문자 8~20자리)',
    required: true,
  })
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: '사용자 이름',
    default: '사용자1',
    required: true,
  })
  name: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: '사용자 이메일',
    default: 'user1@oieho.com',
    required: true,
  })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 미디어로 가입 여부',
    enum: SocialMediaEnum,
    default: SocialMediaEnum.LOCAL,
    required: true,
  })
  @IsEnum(SocialMediaEnum)
  socialMedia: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '사용자 역할',
    enum: RoleEnum,
    default: RoleEnum.MEMBER,
    required: true,
  })
  @IsEnum(SocialMediaEnum)
  role: string;

  @Field()
  @IsNotEmpty()
  @ApiProperty({
    description: '가입일',
    default: '2024-07-10T05:09:36.199+00:00',
  })
  joinDate: Date;

  @Field()
  @IsNotEmpty()
  @ApiProperty({
    description: '최근 수정일',
    default: '2024-07-10T05:09:36.199+00:00',
  })
  modDate: Date;
}
