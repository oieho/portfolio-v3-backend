import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, AuthTokenDto } from './../auth/dto/auth.dto';
import { UserDto } from '../user/dto/user.dto';
import { RefreshTokenDto } from './dto/auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthMongoRepository } from './auth.repository';
import { Document } from 'mongoose';

export interface Payload {
  userId: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private authRepository: AuthMongoRepository,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<UserDto> {
    // const hashedPassword = await bcrypt.hash(loginDto.password, 10);
    // console.log('@@' + hashedPassword);

    const user = await this.userService.findUser(loginDto.userId);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      console.log(loginDto.password);
      console.log(user.password);
      throw new BadRequestException('Invalid credentials!');
    }
    console.log(user);
    return user;
  }

  async generateAccessToken(user: any): Promise<string> {
    const payload: Payload = {
      userId: user.userId,
      role: 'LOCAL',
    };
    return await this.jwtService.signAsync(
      { userId: payload.userId, role: payload.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
      },
    );
  }

  async generateRefreshToken(user: AuthTokenDto): Promise<string> {
    try {
      const payload: Payload = {
        userId: user.userId,
        role: user.role ? user.role : 'LOCAL',
      };
      return await this.jwtService.signAsync(
        { userId: payload.userId, role: payload.role },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION_TIME',
          ),
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async setCurrentRefreshToken(userId: string, refreshToken: string) {
    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();
    await this.authRepository.updateRefreshToken(userId, {
      currentRefreshToken: currentRefreshToken,
      currentRefreshTokenExp: currentRefreshTokenExp,
    });
  }

  async getRefreshTokenByUserId(userId: string): Promise<any | null> {
    try {
      const refreshTokenInfo =
        await this.authRepository.getRefreshToken(userId);
      if (!refreshTokenInfo) {
        return null;
      }

      const refreshTokenDto: RefreshTokenDto = {
        userId: refreshTokenInfo.userId,
        currentRefreshToken: refreshTokenInfo.currentRefreshToken,
        currentRefreshTokenExp: refreshTokenInfo.currentRefreshTokenExp,
      };

      return refreshTokenDto;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  async getCurrentHashedRefreshToken(refreshToken: string) {
    // 토큰 값을 그대로 저장하기 보단, 암호화를 거쳐 데이터베이스에 저장한다.
    // bcrypt는 단방향 해시 함수이므로 암호화된 값으로 원래 문자열을 유추할 수 없다.
    const saltOrRounds = 10;
    const currentRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
    return currentRefreshToken;
  }

  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    // Date 형식으로 데이터베이스에 저장하기 위해 문자열을 숫자 타입으로 변환 (paresInt)
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')),
    );
    return currentRefreshTokenExp;
  }

  async getUserIfRefreshTokenMatches(
    currentRefreshTokenByCookie: Object,
    oldRefreshTokenInDB: string,
  ): Promise<boolean | null> {
    const isRefreshTokenMatching = await bcrypt.compare(
      currentRefreshTokenByCookie,
      oldRefreshTokenInDB,
    );

    if (isRefreshTokenMatching) {
      return true;
    }
  }

  async extractUserInfoFromPayload(payload: any): Promise<Payload | null> {
    try {
      if (payload && payload?.userId && payload.role) {
        return {
          userId: payload.userId,
          role: payload.role,
        };
      }
      return null;
    } catch (error) {
      console.error('페이로드 처리 중 오류:', error);
      return null;
    }
  }

  async removeRefreshToken(userId: string): Promise<any> {
    return await this.authRepository.delete(userId);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(userId: number) {
    return `This action returns a #${userId} auth`;
  }

  update(userId: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${userId} auth`;
  }

  remove(userId: number) {
    return `This action removes a #${userId} auth`;
  }
}
