import { Req, Res } from '@nestjs/common';
import {
  INestApplication,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { AuthMongoRepository } from '../auth/auth.repository';
import { UserMongoRepository } from './user.repository';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { RedisModule } from '../redis/redis.module';
import { UserDto, UserIdAndPasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { RecoverPass } from '../schemas/recoverPass.schema';

describe('UserController', () => {
  let app: INestApplication;
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
        ConfigService,
        AuthService,
        AuthMongoRepository,
        {
          provide: UserService,
          useValue: {
            register: jest.fn(),
            modifyUserByUserId: jest.fn(),
            readUserInfo: jest.fn(),
            qualifyByToken: jest.fn(),
            verifyToken: jest.fn(),
            removeRecoverPassToken: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockReturnValue('Token is valid'),
            verify: jest.fn().mockReturnValue({ userId: 'user11' }),
            extractUserInfoFromPayload: jest
              .fn()
              .mockResolvedValue({ userId: 'user11', role: 'Member' }),
          },
        },
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
        {
          provide: getModelToken(RecoverPass.name),
          useValue: {}, // User 모델의 모의 객체를 설정합니다.
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

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
        role: 'Member',
        joinDate: new Date(),
        modDate: new Date(),
      };
      const resultUserDto: UserDto = {
        userId: 'user11',
        password: process.env.USER11_PASSWORD,
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'Member',
        joinDate: new Date(),
        modDate: new Date(),
      };

      it('register - should register a new user - [success]', async () => {
        const result = { ...userDto, userId: userId };

        jest.spyOn(userService, 'register').mockResolvedValue(userDto);

        const response = await controller.register(userDto);

        expect(userService.register).toHaveBeenCalledWith(userDto);
        expect(response).toEqual(resultUserDto);
      });

      it('modify - should return the userInfo if user is modified - [success]', async () => {
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

      it('userInfo - should get userInfo if userId is provided - [success]', async () => {
        const accessToken = await authService.generateAccessToken(userDto);
        jest
          .spyOn(authService, 'getAccessToken')
          .mockResolvedValue(accessToken);
        jest
          .spyOn(authService, 'extractUserInfoFromPayload')
          .mockResolvedValue({ userId: userDto.userId, role: userDto.role });
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

      describe('FindPassword', () => {
        const resetPassToken = '3080161f-6d21-4056-8c25-0fa1670d35e6';

        it('/QualifiedChangePass/:token (GET) - success', async () => {
          const expectedResult =
            '<html><body><h1>인증이 완료되었습니다.</h1><p>홈페이지로 돌아간 후 비밀번호를 변경하시기 바랍니다.</p></body></html>';

          jest
            .spyOn(userService, 'qualifyByToken')
            .mockResolvedValue(expectedResult);

          const response = await request(app.getHttpServer())
            .get(`/user/QualifiedChangePass/${resetPassToken}`)
            .expect(HttpStatus.OK);

          expect(response.text).toEqual(expectedResult);
          expect(userService.qualifyByToken).toHaveBeenCalledWith(
            resetPassToken,
          );
        });

        it('/AuthorizeChangePass/:token (GET) - success', async () => {
          jest.spyOn(userService, 'verifyToken').mockResolvedValue(true);

          const response = await request(app.getHttpServer())
            .get(`/user/AuthorizeChangePass/${resetPassToken}`)
            .expect(HttpStatus.OK);

          expect(response.body).toEqual(true);
          expect(userService.verifyToken).toHaveBeenCalledWith(resetPassToken);
        });

        it('/DeleteChangePass/:token (DELETE) - [success]', async () => {
          jest
            .spyOn(userService, 'removeRecoverPassToken')
            .mockResolvedValue(undefined);

          const response = await request(app.getHttpServer())
            .delete(`/user/DeleteChangePass/${resetPassToken}`)
            .expect(HttpStatus.NO_CONTENT);

          expect(response.status).toBe(HttpStatus.NO_CONTENT);
          expect(userService.removeRecoverPassToken).toHaveBeenCalledWith(
            resetPassToken,
          );
        });

        it('[/changePW (PUT) - [success]', async () => {
          const userDto: UserIdAndPasswordDto = {
            userId: 'user11',
            password: '11',
          };

          // `changePassword` 메서드를 mock 함수로 설정
          jest
            .spyOn(userService, 'changePassword')
            .mockResolvedValue(undefined);

          const response = await request(app.getHttpServer())
            .put('/user/changePW')
            .send(userDto)
            .expect(HttpStatus.OK);

          // 응답 본문 검증
          expect(response.text).toBe('true');
          // `changePassword` 호출 검증
          expect(userService.changePassword).toHaveBeenCalledWith(
            userDto.userId,
            userDto.password,
          );
        });

        it('/changePW (PUT) - [failure]', async () => {
          const userDto: UserIdAndPasswordDto = {
            userId: 'user11',
            password: '11',
          };

          jest
            .spyOn(userService, 'changePassword')
            .mockRejectedValue(new Error('Error'));

          const response = await request(app.getHttpServer())
            .put('/user/changePW')
            .send(userDto)
            .expect(HttpStatus.INTERNAL_SERVER_ERROR);

          expect(response.text).toBe('false');
          expect(userService.changePassword).toHaveBeenCalledWith(
            userDto.userId,
            userDto.password,
          );
        });
      });
    });
  });
});
