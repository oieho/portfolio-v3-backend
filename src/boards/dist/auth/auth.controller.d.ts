import { Response } from 'express';
import { AuthTokenDto, LoginDto } from './dto/auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from './../user/user.service';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    constructor(authService: AuthService, userService: UserService);
    login(loginDto: LoginDto, res: Response): Promise<any>;
    logout(req: any, res: Response): Promise<any>;
    user(req: any, res: Response): Promise<object>;
    findAll(): string;
    findOne(userId: string): string;
    update(userId: string, updateAuthDto: UpdateAuthDto): string;
    remove(userId: string): string;
    refresh(user: AuthTokenDto, res: Response): Promise<{
        message: string;
    }>;
}
