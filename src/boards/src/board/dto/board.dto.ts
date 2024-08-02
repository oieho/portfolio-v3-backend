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
import { Field, ObjectType, ID } from '@nestjs/graphql';

export enum PortfolioBoardCategoryEnum {
  BROCHURE = 'Brochure',
  LOGO = 'Logo',
  POSTER = 'Poster',
  CHARACTER = 'Character',
  HOMEPAGE = 'Homepage',
  DETAILEDPAGE = 'Detailed Page',
  MAGAZINE = 'Magazine',
  ETC = 'etc',
}

@ObjectType()
export class PortfolioBoardDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500000)
  @ApiProperty({
    description: '포트폴리오 내용',
    default: '포트폴리오 내용',
    required: true,
  })
  pContent: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @ApiProperty({ description: '제목', default: '제목', required: true })
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(560)
  @ApiProperty({ description: '설명', default: '설명', required: true })
  description: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '카테고리',
    enum: PortfolioBoardCategoryEnum,
    required: true,
  })
  @IsEnum(PortfolioBoardCategoryEnum)
  category: string;

  @Field(() => [String])
  @IsString({ each: true })
  @ApiProperty({ description: '사용도구', type: [String] })
  tools: string[];

  @Field(() => [String])
  @IsString({ each: true })
  @ApiProperty({ description: '해시태그', type: [String] })
  hashTag: string[];

  @Field()
  @IsNotEmpty()
  @ApiProperty({ description: '조회수', default: 0 })
  hits: number;

  @Field(() => [ID])
  @ApiProperty({ description: '작업 댓글', type: [String] })
  comment: Types.ObjectId[];

  @Field(() => [ID])
  @ApiProperty({ description: '작업 이미지', type: [String] })
  images: Types.ObjectId[];
}
