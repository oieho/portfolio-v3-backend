import { LoginDto, RefreshTokenDto } from './../auth/dto/auth.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';
import { UserDto } from './../user/dto/user.dto';

export interface AuthRepository {
  findUserById(userId: string): Promise<UserDto>;
  getUserIdAndPassword(userId: string);
  updateRefreshToken(
    userId: string,
    currentRefreshTokenSet: {
      currentRefreshToken: string;
      currentRefreshTokenExp: Date;
    },
  );
}
@Injectable()
export class AuthMongoRepository implements AuthRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async findUserById(userId: string): Promise<UserDto> {
    return await this.userModel.findById(userId);
  }

  async getUserIdAndPassword(userId: string): Promise<UserDocument> {
    return await this.userModel.findById(userId).exec();
  }

  async getRefreshToken(userId: string): Promise<RefreshTokenDto> {
    return await this.refreshTokenModel.findOne({ userId });
  }

  async updateRefreshToken(
    userId: String,
    currentRefreshTokenSet: {
      currentRefreshToken: string;
      currentRefreshTokenExp: Date;
    },
  ) {
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
