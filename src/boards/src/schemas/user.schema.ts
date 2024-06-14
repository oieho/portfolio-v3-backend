import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  IsAlphanumeric,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true, required: true, maxlength: 50 })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Prop()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsAlphanumeric()
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ unique: true, required: true, maxlength: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  socialMedia: string;

  @Prop({ required: true })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
