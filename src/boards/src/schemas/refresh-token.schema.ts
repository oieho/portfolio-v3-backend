import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  currentRefreshToken: string;

  @Prop({ required: true })
  currentRefreshTokenExp: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
