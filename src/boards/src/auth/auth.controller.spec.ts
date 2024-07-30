import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, AuthTokenDto } from './dto/auth.dto';
import { UserDto } from '../user/dto/user.dto';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMongoRepository } from './auth.repository';
import { UserMongoRepository } from '../user/user.repository';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { RedisModule } from '../redis/redis.module';
import { RedisClientType } from 'redis';
import { RecoverPassSchema } from '../schemas/recoverPass.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'RecoverPass', schema: RecoverPassSchema },
        ]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_ACCESS_SECRET'),
            signOptions: { expiresIn: 'JWT_ACCESS_EXPIRATION_TIME' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [
        ConfigService,
        UserMongoRepository,

        {
          provide: UserService,
          useValue: {
            findUser: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            saveAccessToken: jest.fn(),
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            setCurrentRefreshToken: jest.fn(),
            removeRefreshToken: jest.fn(),
            deleteAccessToken: jest.fn(),
            getAccessToken: jest.fn(),
            getRefreshTokenByUserId: jest.fn(),
          },
        },
        { provide: UserService, useValue: { findUser: jest.fn() } },
        {
          provide: AuthMongoRepository,
          useValue: {
            // UserMongoRepository의 메서드들에 대한 모의 객체를 설정합니다.
            updateRefreshToken: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {}, // User 모델의 모의 객체를 설정합니다.
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('LOGIN/AUTHENTICATE/LOGOUT', () => {
    const mockUser: User = {
      userId: 'testuser',
      password: '$2b$10$N9M4.n6D8OKLsMz4KXo96uRwGjJ3YIgkNsGyGL0A5ihY6gIwFztyu', // bcrypt로 해싱된 패스워드
      email: 'test@example.com',
      name: 'Test User',
      socialMedia: 'none',
      role: 'Member',
      joinDate: new Date(),
      modDate: new Date(),
    };

    const mockResponse = {
      setHeader: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    it('LOGIN - should authenticate user and set cookies - [success]', async () => {
      const loginDto: LoginDto = {
        userId: 'testuser',
        password: 'testpassword',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(mockUser as never);
      jest
        .spyOn(authService, 'generateAccessToken')
        .mockResolvedValue('mock token');
      jest
        .spyOn(authService, 'generateRefreshToken')
        .mockResolvedValue('mock token');
      jest
        .spyOn(authService, 'setCurrentRefreshToken')
        .mockResolvedValue(undefined); // 추가
      jest.spyOn(authService, 'saveAccessToken').mockResolvedValue(undefined); // 추가

      const loginResult = await controller.login(loginDto, mockResponse);

      expect(loginResult).toEqual({
        message: 'login success',
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'authorization',
        'Bearer mock token',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String),
        {
          httpOnly: true,
        },
      );
      expect(authService.setCurrentRefreshToken).toHaveBeenCalledWith(
        'testuser',
        'mock token',
      );
      expect(authService.saveAccessToken).toHaveBeenCalledWith(
        'testuser',
        'mock token',
      );
    });

    it('AUTHENTICATE - should return the verified user object if authentication is successful - [success]', async () => {
      const req: any = {
        user: { userId: 'user11' },
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const verifiedUser = { id: 'user11' };

      jest.spyOn(userService, 'findUser').mockResolvedValue(verifiedUser);

      await controller.user(req, res as Response);

      expect(userService.findUser).toHaveBeenCalledWith('user11');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(verifiedUser);
    });

    it('AUTHENTICATE - should return an error message if authentication fails - [failure]', async () => {
      const req: any = {
        user: { userId: 'user11' },
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      jest
        .spyOn(userService, 'findUser')
        .mockRejectedValue(new Error('Database error'));

      await controller.user(req, res as Response);

      expect(userService.findUser).toHaveBeenCalledWith('user11');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Authentication failed',
      });
    });

    it('LOGOUT - should logout user and remove token and cookie - [success]', async () => {
      const deleteAccessTokenSpy = await jest
        .spyOn(authService, 'deleteAccessToken')
        .mockResolvedValue(1);
      const removeRefreshTokenSpy = await jest
        .spyOn(authService, 'removeRefreshToken')
        .mockResolvedValue('testuser');

      // Logout 메서드 호출
      await controller.logout({ userId: mockUser.userId }, mockResponse);

      // 응답 확인
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: 'logout success',
      });

      expect(deleteAccessTokenSpy).toHaveBeenCalledWith(mockUser.userId);
      expect(removeRefreshTokenSpy).toHaveBeenCalledWith(mockUser.userId);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('refresh page', () => {
    const user: AuthTokenDto = { userId: 'user11', role: 'Member' };
    const res: Partial<Response> = {
      cookie: jest.fn(),
    };
    it('Should check whether the token refreshes successfully if the refresh token will be expired in 3 days  - [success]', async () => {
      const refreshToken = {
        currentRefreshTokenExp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 밀리세컨드 값이 현재 설정 된 값보다 1이 높을 경우 3일 이상이므로 테스트 실패
      };

      jest
        .spyOn(authService, 'getRefreshTokenByUserId')
        .mockResolvedValue(refreshToken);
      jest
        .spyOn(authService, 'generateRefreshToken')
        .mockResolvedValue('newRefreshToken');
      jest
        .spyOn(authService, 'setCurrentRefreshToken')
        .mockResolvedValue(undefined);

      const result = await controller.refresh(user, res as Response);

      expect(authService.getRefreshTokenByUserId).toHaveBeenCalledWith(
        'user11',
      );
      expect(authService.generateRefreshToken).toHaveBeenCalledWith(user);
      expect(authService.setCurrentRefreshToken).toHaveBeenCalledWith(
        'user11',
        'newRefreshToken',
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'newRefreshToken',
        {
          httpOnly: true,
        },
      );
      expect(result).toEqual({ message: 'Token refreshed successfully' });
    });

    it('RefreshToken - should return an error message if an exception is thrown - [failure]', async () => {
      jest
        .spyOn(authService, 'getRefreshTokenByUserId')
        .mockRejectedValue(new Error('Database error'));

      const result = await controller.refresh(user, res as Response);

      expect(authService.getRefreshTokenByUserId).toHaveBeenCalledWith(
        'user11',
      );
      expect(result).toEqual({
        message: 'Token operation failedError: Database error',
      });
    });
  });
});
