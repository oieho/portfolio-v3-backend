import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMongoRepository } from './auth.repository';
import { UserMongoRepository } from '../user/user.repository';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true, // 전역으로 사용 가능하게 설정
        }),
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
        AuthService,
        UserService,
        ConfigService,
        AuthMongoRepository,
        UserMongoRepository,
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
  });

  it('should authenticate user and set cookies', async () => {
    const loginDto: LoginDto = {
      userId: 'testuser',
      password: 'testpassword',
    };

    const mockUser: User = {
      userId: 'testuser',
      password: '$2b$10$N9M4.n6D8OKLsMz4KXo96uRwGjJ3YIgkNsGyGL0A5ihY6gIwFztyu', // bcrypt로 해싱된 패스워드
      email: 'test@example.com',
      name: 'Test User',
      socialMedia: 'none',
      role: 'user',
      joinDate: new Date(),
      modDate: new Date(),
    };

    // Mock AuthService의 validateUser 메서드
    jest
      .spyOn(authService, 'validateUser')
      .mockResolvedValue(mockUser as never);

    // Mock Response 객체 생성
    const mockResponse = {
      setHeader: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    // Login 메서드 호출
    const loginResult = await controller.login(loginDto, mockResponse);
    // Test logout method
    // 반환값 확인
    expect(loginResult).toEqual({
      message: 'login success',
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
    // AuthService의 validateUser가 호출되었는지 확인
    expect(authService.validateUser).toHaveBeenCalledWith(loginDto);

    // 쿠키 설정 확인
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'access_token',
      expect.any(String),
      {
        httpOnly: true,
      },
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      {
        httpOnly: true,
      },
    );

    const removeRefreshTokenSpy = jest
      .spyOn(authService, 'removeRefreshToken')
      .mockImplementation(async () => {
        // Mock implementation for removing refresh token
      });
    await controller.logout({ user: { id: mockUser.userId } }, mockResponse);

    expect(mockResponse.send).toHaveBeenCalledWith({
      message: 'logout success',
    });
    expect(removeRefreshTokenSpy).toHaveBeenCalledWith(mockUser.userId);
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후에 모든 Mock 함수를 초기화
  });
});
