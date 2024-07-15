import { Req, Res } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { AuthMongoRepository } from '../auth/auth.repository';
import { UserMongoRepository } from './user.repository';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { RedisModule } from '../redis/redis.module';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

describe('UserController', () => {
  let authService: AuthService;
  let controller: UserController;
  let userService: UserService;
  let userRepository: UserMongoRepository;

  afterEach(async () => {
    jest.restoreAllMocks(); // 모든 모의(Mock) 함수 복구
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule,
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
      controllers: [UserController],
      providers: [
        AuthService,
        UserService,
        AuthMongoRepository,
        {
          provide: UserMongoRepository,
          useValue: {
            findUser: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('user Controller', () => {
    describe('user registers and modifies and gets userInfo ', () => {
      const userId = 'user11';
      const userDto: UserDto = {
        userId: 'user11',
        password: process.env.USER11_PASSWORD,
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      };
      const resultUserDto: UserDto = {
        userId: 'user11',
        password: process.env.USER11_PASSWORD,
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      };

      it('should register a new user', async () => {
        const result = { ...userDto, userId: userId };

        jest.spyOn(userService, 'register').mockResolvedValue(userDto);

        const response = await controller.register(userDto);

        expect(userService.register).toHaveBeenCalledWith(userDto);
        expect(response).toEqual(resultUserDto);
      });

      it('should return the userInfo if user is modified', async () => {
        jest
          .spyOn(userService, 'modifyUserByUserId')
          .mockResolvedValue(userDto);

        const result = await controller.modifyUserByUserId(userId, userDto);

        expect(userService.modifyUserByUserId).toHaveBeenCalledWith(
          userId,
          userDto,
        );
        expect(result).toEqual(expect.objectContaining(resultUserDto));
      });

      it('should get userInfo if userId is provided', async () => {
        const accessToken = await authService.generateAccessToken(userDto);
        jest
          .spyOn(authService, 'getAccessToken')
          .mockResolvedValue(accessToken);
        jest.spyOn(userService, 'readUserInfo').mockResolvedValue(userDto);

        const request = {
          cookies: { refresh_token: 'mocked-refresh-token' },
        } as unknown as Request;
        const response = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockImplementation((data) => data), // 실제 데이터를 반환하도록 설정
        } as unknown as Response;

        // Controller 메서드 호출
        const result = await controller.getMyInfo(
          userId,
          request as any,
          response as any,
        );

        // 테스트
        expect(authService.getAccessToken).toHaveBeenCalledWith(userId);
        expect(userService.readUserInfo).toHaveBeenCalledWith(userDto.userId);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(resultUserDto);
        expect(result).toEqual(resultUserDto);
      });
    });
    describe('should return userName, userEmail, userName and userEmail if they exists', () => {
      const userName = '사용자1';
      const userEmail = 'user1@oieho.com';

      it('should return true if userName exists', async () => {
        jest
          .spyOn(userService, 'findUserName')
          .mockImplementation(async (name: string) => {
            const exists = name === '사용자1';
            return exists;
          });

        const result = await controller.confirmUserName(userName);

        expect(result).toEqual(true);
      });

      it('should return true if userEmail exists', async () => {
        jest
          .spyOn(userService, 'findUserEmail')
          .mockImplementation(async (email: string) => {
            const exists = email === 'user1@oieho.com'; // 예시로 사용자 1이 존재한다고 가정(DB조회가 아니라 가짜로 띄움)
            return exists;
          });

        const result = await controller.confirmUserEmail(userEmail);

        expect(result).toEqual(true);
      });

      it('should return true if name and email match', async () => {
        jest
          .spyOn(userService, 'existsByUserNameAndUserEmail')
          .mockImplementation(async (name: string, email: string) => {
            // name이 'user1'이고 email이 'user1@oieho.com'일 때만 true를 반환하도록 구현
            if (name === '사용자1' && email === 'user1@oieho.com') {
              return true;
            } else {
              return false;
            }
          });

        const result = await controller.confirmIfMatchNameAndEmail(
          userName,
          userEmail,
        );

        expect(result).toEqual(true);
      });
    });
  });
});
