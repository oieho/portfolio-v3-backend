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
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { RedisModule } from '../redis/redis.module';
import { createClient, RedisClientType } from 'redis';
import { RecoverPassSchema } from '../schemas/recoverPass.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let authMongoRepository: AuthMongoRepository;

  const redisClientMock = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue('sample_token'),
    del: jest.fn().mockResolvedValue(1),
  } as unknown as RedisClientType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule,
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
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock,
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            deleteAccessToken: jest.fn(),
            saveAccessToken: jest.fn().mockResolvedValue(undefined),
          },
        },
        UserService,
        {
          provide: AuthMongoRepository,
          useValue: {
            // UserMongoRepository의 메서드들에 대한 모의 객체를 설정합니다.
            updateRefreshToken: jest.fn(),
            delete: jest.fn(),
          },
        },
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
    authMongoRepository = module.get<AuthMongoRepository>(AuthMongoRepository);
  });

  const userId = 'user11';
  const token = 'sample_token';
  const expirationTime =
    parseInt(process.env.JWT_ACCESS_EXPIRATION_TIME, 10) / 1000;

  it('Redis AccessToken - should save access token to Redis', async () => {
    await authService.saveAccessToken(userId, token);

    expect(redisClientMock.set).toHaveBeenCalledWith(
      `access_token:${userId}`,
      token,
      { EX: expirationTime },
    );
  });

  it('Redis AccessToken - should retrieve access token from Redis', async () => {
    const result = await authService.getAccessToken(userId);

    expect(redisClientMock.get).toHaveBeenCalledWith(`access_token:${userId}`);
    expect(result).toBe(token);
  });

  it('Redis AccessToken - should delete access token from Redis', async () => {
    await authService.deleteAccessToken(userId);

    expect(authService.deleteAccessToken).toHaveBeenCalledWith(userId);
    expect(redisClientMock.del).toHaveBeenCalledWith(`access_token:${userId}`);
  });

  it('LOGIN/LOGOUT - should authenticate user and set cookies', async () => {
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
      role: 'Member',
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

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(String),
      {
        httpOnly: true,
      },
    );

    const removeRefreshTokenSpy = jest
      .spyOn(authMongoRepository, 'delete')
      .mockResolvedValue('testuser');
    const deleteAccessTokenSpy = jest
      .spyOn(authMongoRepository, 'delete')
      .mockResolvedValue('testuser');

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
