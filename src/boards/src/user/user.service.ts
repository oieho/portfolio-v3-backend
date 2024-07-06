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
import { UserDto, UserIdDto } from './dto/user.dto';
import { LoginDto } from './../auth/dto/auth.dto';
import { UserMongoRepository } from './user.repository';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserMongoRepository) {}

  async register(userDto: UserDto) {
    // ❸ 메서드 내부에 await 구문이 있으므로 async 필요
    // ❹ 이미 가입된 유저가 있는지 체크
    const userId = await this.findUser(userDto.userId);
    if (userId) {
      // ❺ 이미 가입된 유저가 있다면 에러 발생
      throw new HttpException(
        '해당 유저가 이미 있습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // ❻ 패드워드 암호화
    const encryptedPassword = bcrypt.hashSync(userDto.password, 10);
    console.log(encryptedPassword);
    try {
      const user = await this.createUser({
        ...userDto,
        password: encryptedPassword,
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      });
      // ❼ 회원 가입 후 반환하는 값에는 password를 주지 않음
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

  async findUser(userId): Promise<UserIdDto | any> {
    const result = await this.userRepository.findUser(userId);
    return result;
  }

  async readUserInfo(user: string): Promise<UserDto> {
    const result = await this.userRepository.findUser(user);
    console.log('RESULT::' + result);
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
