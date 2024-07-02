import { LoginUserDto } from './dto/user.dto';
import { UserDto } from './dto/user.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

export interface UserRepository {
  findUserById(userId: string): Promise<UserDto>;
  getAllPost(): Promise<UserDto[]>;
  createPost(postDto: LoginUserDto);
  deletePost(userId: string);
}
@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUserById(userId: string): Promise<UserDto> {
    return await this.userModel.findOne({ userId });
  }

  async getAllPost(): Promise<UserDto[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.toUserDto(user));
  }

  async createPost(postDto: LoginUserDto) {
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
    };
  }
}
