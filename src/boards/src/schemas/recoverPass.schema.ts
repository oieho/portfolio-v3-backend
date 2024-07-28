import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, MaxLength } from 'class-validator';

export type RecoverPassDocument = RecoverPass & Document;

@Schema()
export class RecoverPass {
  @Prop({ required: true })
  @IsNotEmpty()
  @MaxLength(256)
  resetToken: string;
}

export const RecoverPassSchema = SchemaFactory.createForClass(RecoverPass);
