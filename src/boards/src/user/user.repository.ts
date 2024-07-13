import { UserIdAndPasswordDto } from './dto/user.dto';
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
  findUser(userId: string): Promise<UserDto>;
  getAllPost(): Promise<UserDto[]>;
  createPost(postDto: UserIdAndPasswordDto);
  deletePost(userId: string);
}
@Injectable()
export class UserMongoRepository implements UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUser(userId: string): Promise<UserDto | any> {
    return await this.userModel.findOne({ userId });
  }

  async findUserId(name: string): Promise<any> {
    const user = await this.userModel.findOne({ name }, 'userId');

    return user.userId;
  }

  async findUserName(name: string): Promise<any> {
    const userName = (await this.userModel.findOne({ name })) as string;

    return userName;
  }

  async findUserEmail(email: string): Promise<any> {
    const userEmail = (await this.userModel.findOne({ email })) as string;

    return userEmail;
  }

  async findUserNameAndUserEmail(name: string, email: string): Promise<Object> {
    const ifMatches = await this.userModel.findOne(
      { name, email },
      'name email',
    );
    return ifMatches;
  }

  async saveUser(user: UserDto): Promise<UserDto> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async findByUserIdAndUpdate(
    userId: string,
    userDto: UserDto,
  ): Promise<UserDto> {
    userDto.modDate = new Date();
    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { userId },
        userDto,
        { new: true },
      );
      return updatedUser.toObject();
    } catch (error) {
      throw new Error(
        `Failed to update user with userId ${userId}: ${error.message}`,
      );
    }
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
