import { LoginDto, RefreshTokenDto } from './../auth/dto/auth.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

export interface AuthRepository {
  getRefreshToken(userId: string): Promise<RefreshTokenDto>;
  updateRefreshToken(
    userId: string,
    currentRefreshTokenSet: {
      currentRefreshToken: string;
      currentRefreshTokenExp: Date;
    },
  ): Promise<void>;
  delete(userId: string): Promise<any>;
}
@Injectable()
export class AuthMongoRepository implements AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async getRefreshToken(userId: string): Promise<RefreshTokenDto> {
    return await this.refreshTokenModel.findOne({ userId }).lean();
  }

  async updateRefreshToken(
    userId: String,
    currentRefreshTokenSet: {
      currentRefreshToken: string;
      currentRefreshTokenExp: Date;
    },
  ): Promise<void> {
    await this.refreshTokenModel.findOneAndUpdate(
      { userId },
      {
        currentRefreshToken: currentRefreshTokenSet.currentRefreshToken,
        currentRefreshTokenExp: currentRefreshTokenSet.currentRefreshTokenExp,
      },
      { upsert: true },
    );
  }

  async delete(userId: string): Promise<any> {
    return await this.refreshTokenModel.deleteOne({ userId: userId });
  }
}
