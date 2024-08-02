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
import { PortfolioBoardImage } from './image.schema';

export type PortfolioBoardDocument = PortfolioBoard & Document;

export enum Category {
  BROCHURE = 'Brochure',
  LOGO = 'Logo',
  POSTER = 'Poster',
  CHARACTER = 'Character',
  HOMEPAGE = 'Homepage',
  DETAILEDPAGE = 'Detailed Page',
  MAGAZINE = 'Magazine',
  ETC = 'etc',
}

@Schema({ timestamps: { createdAt: 'regDate', updatedAt: 'modDate' } })
export class PortfolioBoard {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 1500000 })
  @MinLength(1)
  @MaxLength(1500000)
  @IsString()
  pContent: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 30 })
  @MinLength(1)
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 560 })
  @MinLength(1)
  @MaxLength(500)
  @IsString()
  description: string;

  @Prop({ type: String, required: true, enum: Category })
  @IsString()
  @IsNotEmpty()
  category: Category;

  @Prop({ type: [String], default: [] })
  tools: string[];

  @Prop({ type: [String], default: [] })
  hashTag: string[];

  @Prop({ type: Number })
  @IsAlphanumeric()
  @IsString()
  @IsNotEmpty()
  hits: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PortfolioBoardComment' }] })
  @IsNotEmpty()
  @Type(() => PortfolioBoardComment)
  portfolioBoardComment: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PortfolioBoardImage' }] })
  @IsNotEmpty()
  @Type(() => PortfolioBoardImage)
  portfolioBoardImages: Types.ObjectId[];

  @Prop({ required: true, type: Date, default: Date.now })
  regDate: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  modDate: Date;
}

export const PortfolioBoardSchema =
  SchemaFactory.createForClass(PortfolioBoard);
