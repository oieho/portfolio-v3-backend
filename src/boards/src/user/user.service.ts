import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './../auth/dto/auth.dto';
import { UserMongoRepository } from './user.repository';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserMongoRepository,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(userDto: UserDto) {
    const userId = await this.findUser(userDto.userId);
    if (userId) {
      throw new HttpException(
        '해당 사용자가 이미 존재합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 패드워드 암호화
    const encryptedPassword = bcrypt.hashSync(userDto.password, 10);
    try {
      const user = await this.createUser({
        ...userDto,
        password: encryptedPassword,
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      });
      // 회원 가입 후 반환하는 값에는 password를 주지 않음
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('서버 에러 : ' + error, 500);
    }
  }

  async modifyUserByUserId(userId: string, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUser(userId);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!(await bcrypt.compare(userDto.password, user.password))) {
      throw new BadRequestException('Invalid password!');
    }
    userDto.password = bcrypt.hashSync(userDto.password, 10);
    return this.userRepository.findByUserIdAndUpdate(userId, userDto);
  }

  async findUserByCriteria(criteria: Partial<UserDto>): Promise<any | null> {
    return this.userModel.findOne(criteria).lean() as Promise<any | null>;
  }

  async findUserId(name: string): Promise<string> {
    const result = await this.userRepository.findUserId(name);
    return result;
  }

  async findUser(userId: string): Promise<string | any> {
    const result = await this.userRepository.findUser(userId);
    return result;
  }

  async readUserInfo(userId: string): Promise<UserDto> {
    const result = await this.userRepository.findUser(userId);
    return result;
  }
  createUser(user): Promise<UserDto> {
    return this.userRepository.saveUser(user);
  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(userId: number) {
    return `This action returns a #${userId} user`;
  }

  update(userId: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${userId} user`;
  }

  remove(userId: number) {
    return `This action removes a #${userId} user`;
  }
}
