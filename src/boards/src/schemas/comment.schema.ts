import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { PortfolioBoard } from './board.schema';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

@Schema({ timestamps: { createdAt: 'regDate', updatedAt: 'modDate' } })
export class PortfolioBoardComment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'PortfolioBoard', required: true })
  @IsNotEmpty()
  @Type(() => PortfolioBoard)
  portfolioBoard: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsNotEmpty()
  @Type(() => User)
  user: Types.ObjectId;

  @Prop({ type: Number })
  @IsNumber()
  face: number;

  @Prop({ type: String, required: true, minlength: 1, maxlength: 150 })
  @IsString()
  @IsNotEmpty()
  text: string;

  @Prop({ type: Number })
  @IsNumber()
  uid: number;

  @Prop({ type: Number })
  @IsNumber()
  depth: number;

  @Prop({ type: Number })
  @IsNumber()
  rnum: number;

  @Prop({ type: Number })
  @IsNumber()
  rdepth: number;

  @Prop({ required: true, type: Date, default: Date.now })
  regDate: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  modDate: Date;
}

export const PortfolioBoardCommentSchema = SchemaFactory.createForClass(
  PortfolioBoardComment,
);
