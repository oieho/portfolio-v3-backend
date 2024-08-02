import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PortfolioBoardComment } from './comment.schema';

export type UserDocument = User & Document;

export enum socialMedia {
  KAKAO = 'Kakao',
  NAVER = 'Naver',
  GOOGLE = 'Google',
  LOCAL = 'local',
}

export enum role {
  MEMBER = 'Member',
  ADMIN = 'Administrator',
}

@Schema({ timestamps: { createdAt: 'joinDate', updatedAt: 'modDate' } })
export class User {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
  @IsNotEmpty()
  @Type(() => PortfolioBoardComment)
  comment: Types.ObjectId[];

  @Prop({ unique: true, required: true, maxlength: 50 }) //MongoDB에서 저장되는 데이터의 구조
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Prop({ required: true, minLength: 8, maxLength: 70 })
  @IsString()
  @MinLength(8) //주로 DTO(Data Transfer Object)에서 사용
  @MaxLength(20)
  @IsNotEmpty()
  @IsAlphanumeric()
  password: string;

  @Prop({ required: true })
  @IsNotEmpty()
  email: string;

  @Prop({ unique: true, required: true, maxlength: 100 })
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true, enum: socialMedia })
  @IsString()
  @IsNotEmpty()
  socialMedia: string;

  @Prop({ required: true, enum: role })
  @IsString()
  @IsNotEmpty()
  role: string;

  @Prop({ required: true, type: Date, default: Date.now })
  @IsString()
  @IsNotEmpty()
  joinDate: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  @IsString()
  @IsNotEmpty()
  modDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
