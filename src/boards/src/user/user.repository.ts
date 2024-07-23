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
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

export interface UserRepository {
  getAllPost(): Promise<UserDto[]>;
  createPost(postDto: UserIdAndPasswordDto);
  deletePost(userId: string);
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
    const user = await this.userModel.findOne({ name }, 'userId').lean();

    return user.userId;
  }

  async findEmailByUserId(userId: string): Promise<string> {
    const user = await this.userModel.findOne({ userId }, 'email').lean();

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

  async getAllPost(): Promise<UserDto[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.toUserDto(user));
  }

  async createPost(postDto: UserIdAndPasswordDto) {
    const createPost = {
      ...postDto,
      createdDt: new Date(),
      updatedDt: new Date(),
    };
    await this.userModel.create(createPost);
  }

  async deletePost(userId: string) {
    await this.userModel.findByIdAndDelete(userId);
  }

  private toUserDto(user: UserDocument): UserDto {
    return {
      userId: user.userId,
      password: user.password,
      email: user.email,
      name: user.name,
      socialMedia: user.socialMedia,
      role: user.role,
      joinDate: user.joinDate,
      modDate: user.modDate,
    };
  }
}
