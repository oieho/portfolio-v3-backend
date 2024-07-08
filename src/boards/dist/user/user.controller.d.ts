import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
export declare class UserController {
    private readonly authService;
    private readonly userService;
    private readonly jwtService;
    constructor(authService: AuthService, userService: UserService, jwtService: JwtService);
    register(userDto: UserDto): Promise<UserDto>;
    modifyUserByUserId(userId: string, userDto: UserDto): Promise<UserDto>;
    getMyInfo(request: Request, response: Response): Promise<any>;
    create(createUserDto: CreateUserDto): string;
    findAll(): string;
    findOne(userId: string): string;
    update(userId: string, updateUserDto: UpdateUserDto): string;
    remove(userId: string): string;
}
