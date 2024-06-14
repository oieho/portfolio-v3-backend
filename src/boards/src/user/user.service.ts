import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { LoginDto } from './../auth/dto/auth.dto';
import { UserMongoRepository } from './user.repository';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserMongoRepository) {}

  findUserById(userId): Promise<UserDto> {
    return this.userRepository.findUserById(userId);
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
