import { UserIdAndPasswordDto } from './dto/user.dto';
import { UserDto } from './dto/user.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  RecoverPass,
  RecoverPassDocument,
} from '../schemas/recoverPass.schema';

export interface UserRepository {
  findUser(userId: string): Promise<UserDto | any>;
  findUserId(name: string): Promise<any>;
  findEmailByUserId(userId: string): Promise<string>;
  saveUser(user: UserDto): Promise<UserDto>;
  recoveryPassToken(token: string): Promise<void>;
  findByUserIdAndUpdate(userId: string, userDto: UserDto): Promise<UserDto>;
  changePassword(userId: string, encryptedPassword: string);
  findByEncodedPw(userId: string): Promise<string | null>;
  existsByUserIdAndUserPw(userId: string, encodedPw: string): Promise<boolean>;
}
@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RecoverPass.name)
    private recoverPassModel: Model<RecoverPassDocument>,
  ) {}

  async findUser(userId: string): Promise<UserDto | any> {
    return await this.userModel.findOne({ userId }).lean();
  }

  async findUserId(name: string): Promise<any> {
    const user = await this.userModel.findOne({ name }).select('userId').lean();

    return user.userId;
  }

  async findEmailByUserId(userId: string): Promise<string> {
    const user = await this.userModel
      .findOne({ userId })
      .select('email')
      .lean();

    return user.email;
  }

  async saveUser(user: UserDto): Promise<UserDto> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async recoveryPassToken(token: string): Promise<void> {
    const newToken = new this.recoverPassModel({ resetToken: token });
    await newToken.save();
  }

  async findByUserIdAndUpdate(
    userId: string,
    userDto: UserDto,
  ): Promise<UserDto> {
    userDto.modDate = new Date();
    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate({ userId }, userDto, { new: true })
        .lean();
      return updatedUser;
    } catch (error) {
      throw new Error(
        `Failed to update user with userId ${userId}: ${error.message}`,
      );
    }
  }

  async changePassword(userId: string, encryptedPassword: string) {
    await this.userModel
      .findOneAndUpdate({ userId: userId }, { password: encryptedPassword })
      .lean();
  }

  async findByEncodedPw(userId: string): Promise<string | null> {
    const user = await this.userModel
      .findOne({ userId })
      .select('password')
      .lean();
    return user ? user.password : null;
  }

  async existsByUserIdAndUserPw(
    userId: string,
    password: string,
  ): Promise<boolean> {
    const user = await this.userModel.findOne({ userId, password }).lean();

    console.log('User:', user);
    return !!user;
  }
}
