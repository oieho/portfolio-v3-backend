import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';
import { PortfolioBoard } from './board.schema';

@Schema()
export class PortfolioBoardImage extends Document {
  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  imgName: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: Types.ObjectId, ref: 'PortfolioBoard', required: true })
  @Type(() => PortfolioBoard)
  PortfolioBoard: Types.ObjectId;
}

export const PortfolioBoardImageSchema =
  SchemaFactory.createForClass(PortfolioBoardImage);
