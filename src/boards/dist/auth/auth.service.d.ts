import { UserService } from './../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, AuthTokenDto } from './../auth/dto/auth.dto';
import { UserDto } from './../user/dto/user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthMongoRepository } from './auth.repository';
export interface Payload {
    userId: string;
    role: string;
}
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly configService;
    private authRepository;
    constructor(userService: UserService, jwtService: JwtService, configService: ConfigService, authRepository: AuthMongoRepository);
    validateUser(loginDto: LoginDto): Promise<UserDto>;
    generateAccessToken(user: any): Promise<string>;
    generateRefreshToken(user: AuthTokenDto): Promise<string>;
    setCurrentRefreshToken(userId: string, refreshToken: string): Promise<void>;
    getRefreshTokenByUserId(userId: string): Promise<any | null>;
    getCurrentHashedRefreshToken(refreshToken: string): Promise<any>;
    getCurrentRefreshTokenExp(): Promise<Date>;
    getUserIfRefreshTokenMatches(currentRefreshTokenByCookie: Object, oldRefreshTokenInDB: string): Promise<boolean | null>;
    extractUserInfoFromPayload(payload: any): Promise<Payload | null>;
    removeRefreshToken(userId: string): Promise<any>;
    findAll(): string;
    findOne(userId: number): string;
    update(userId: number, updateAuthDto: UpdateAuthDto): string;
    remove(userId: number): string;
}
