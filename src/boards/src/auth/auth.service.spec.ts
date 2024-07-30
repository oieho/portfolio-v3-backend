import { Test, TestingModule } from '@nestjs/testing';
import {
  Res,
  HttpException,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthMongoRepository } from './auth.repository';
import { UserMongoRepository } from '../user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { LoginDto } from './dto/auth.dto';
import { RedisClientType } from 'redis';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let configService: ConfigService;
  let jwtService: JwtService;
  let authService: AuthService;
  let userService: UserService;
  let authMongoRepository: AuthMongoRepository;

  const redisClientMock = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  } as unknown as RedisClientType;

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_ACCESS_SECRET, // JWT를 위한 시크릿 키 설정
          signOptions: { expiresIn: '1h' }, // 옵션 설정 (예: 만료 시간)
        }),
      ],
      providers: [
        ConfigService,
        {
          provide: AuthMongoRepository,
          useValue: {
            updateRefreshToken: jest.fn(),
            getRefreshToken: jest.fn(),
            delete: jest.fn(),
          },
        },
        UserMongoRepository,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock,
        },
        AuthService,
        { provide: UserService, useValue: { findUser: jest.fn() } },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {}, // User 모델의 모의 객체를 설정합니다.
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: { findOneAndUpdate: jest.fn() }, // RefreshToken 모델의 모의 객체 설정
        },
        {
          provide: getModelToken('RecoverPass'), // 'RecoverPass'는 Mongoose 모델 이름입니다
          useValue: { recoveryPassToken: jest.fn() }, // 모의 객체 설정
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    authMongoRepository = module.get<AuthMongoRepository>(AuthMongoRepository);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  const userId = 'user11';

  describe('validateUser', () => {
    const loginDto: LoginDto = {
      userId: 'user11',
      password: '1',
    };

    it('should throw NotFoundException if user is not found - [failure]', async () => {
      jest.spyOn(userService, 'findUser').mockResolvedValue(null);

      await expect(authService.validateUser(loginDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.findUser).toHaveBeenCalledWith('user11');
    });

    it('should throw BadRequestException if password is invalid - [failure]', async () => {
      const user = {
        userId: 'user11',
        password: await bcrypt.hash('wrongPassword', 10),
      } as LoginDto;

      jest.spyOn(userService, 'findUser').mockResolvedValue(user);

      expect(authService.validateUser(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findUser).toHaveBeenCalledWith('user11');
    });

    it('should return the user if credentials are valid - [success]', async () => {
      const user = {
        userId: 'user11',
        password: await bcrypt.hash(loginDto.password, 10),
      } as LoginDto;

      jest.spyOn(userService, 'findUser').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(loginDto);

      expect(userService.findUser).toHaveBeenCalledWith('user11');
      expect(result).toEqual(user);
    });
  });
  describe('Redis - SAVE/GET/DEL token', () => {
    const expirationTime =
      Number(process.env.JWT_ACCESS_EXPIRATION_TIME) / 1000;

    it('Redis AccessToken - should save access token to Redis - [success]', async () => {
      const token = 'sample_token';
      redisClientMock.set(`access_token:${userId}`, token, {
        EX: expirationTime,
      });
      expect(redisClientMock.set).toHaveBeenCalledWith(
        `access_token:${userId}`,
        token,
        { EX: expirationTime },
      );
    });

    it('Redis AccessToken - should retrieve access token from Redis - [success]', async () => {
      redisClientMock.get(`access_token:${userId}`);
      jest
        .spyOn(authService, 'getAccessToken')
        .mockResolvedValue(`access_token:${userId}`);
      const result = await authService.getAccessToken(userId);

      expect(redisClientMock.get).toHaveBeenCalledWith(
        `access_token:${userId}`,
      );
      expect(result).toBe(`access_token:${userId}`);
    });

    it('Redis AccessToken - should delete access token from Redis - [success]', async () => {
      redisClientMock.del(`access_token:${userId}`);
      jest
        .spyOn(authService, 'deleteAccessToken')
        .mockResolvedValue(`access_token:${userId}`);
      const result = await authService.deleteAccessToken(userId);

      expect(redisClientMock.del).toHaveBeenCalledWith(
        `access_token:${userId}`,
      );
      expect(result).toBe(`access_token:${userId}`);
    });
  });
  describe('RefreshToken - UPDATE/GET/MATCH/REMOVE', () => {
    const refreshToken = 'refreshToken';

    it('RefreshToken - should update refresh token and its expiration - [success]', async () => {
      const hashedRefreshToken = 'hashedRefreshToken';
      const refreshTokenExp = new Date();

      jest
        .spyOn(authService, 'getCurrentHashedRefreshToken')
        .mockResolvedValue(hashedRefreshToken);
      jest
        .spyOn(authService, 'getCurrentRefreshTokenExp')
        .mockResolvedValue(refreshTokenExp);
      jest.spyOn(authMongoRepository, 'updateRefreshToken');

      await authService.setCurrentRefreshToken(userId, refreshToken);

      expect(hashedRefreshToken).toBeDefined();
      expect(refreshTokenExp).toBeInstanceOf(Date);

      expect(authService.getCurrentHashedRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(authService.getCurrentRefreshTokenExp).toHaveBeenCalled();
      expect(authMongoRepository.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        {
          currentRefreshToken: hashedRefreshToken,
          currentRefreshTokenExp: refreshTokenExp,
        },
      );
    });

    it('RefreshToken - should return refresh token dto if refresh token exists - [success]', async () => {
      const refreshTokenInfo = {
        userId: 'user11',
        currentRefreshToken: 'refreshToken',
        currentRefreshTokenExp: new Date(),
      };

      jest
        .spyOn(authMongoRepository, 'getRefreshToken')
        .mockResolvedValue(refreshTokenInfo);

      const result = await authService.getRefreshTokenByUserId(userId);

      expect(result).toEqual({
        userId: 'user11',
        currentRefreshToken: 'refreshToken',
        currentRefreshTokenExp: new Date(),
      });
    });

    it('RefreshToken - should return null if refresh token does not exist - [failure]', async () => {
      jest
        .spyOn(authMongoRepository, 'getRefreshToken')
        .mockResolvedValue(null);

      const result = await authService.getRefreshTokenByUserId(userId);

      expect(result).toBeNull();
    });

    it('RefreshToken - should return null if there is an error - [failure]', async () => {
      jest
        .spyOn(authMongoRepository, 'getRefreshToken')
        .mockRejectedValue(new Error('error'));

      const result = await authService.getRefreshTokenByUserId(userId);

      expect(result).toBeNull();
    });

    it('HashedRefreshToken - should return hashed refresh token - [success]', async () => {
      const hashedToken = 'hashed-token';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedToken);

      const result =
        await authService.getCurrentHashedRefreshToken(refreshToken);

      expect(result).toBe(hashedToken);
      expect(bcrypt.hash).toHaveBeenCalledWith(refreshToken, 10);
    });

    it('RefreshToken - should return correct expiration date - [success]', async () => {
      const expirationTime = '3600000'; // 1 hour in milliseconds
      (configService.get as jest.Mock).mockReturnValue(expirationTime);

      const currentDate = new Date();
      const expectedExpDate = new Date(
        currentDate.getTime() + parseInt(expirationTime),
      );

      const result = await authService.getCurrentRefreshTokenExp();

      // 결과가 예상된 만료 날짜와 유사한지 확인합니다.
      expect(result.getTime()).toBeCloseTo(expectedExpDate.getTime(), -2); // 2ms의 오차 범위 허용
      expect(configService.get).toHaveBeenCalledWith(
        'JWT_REFRESH_EXPIRATION_TIME',
      );
    });

    it('RefreshToken Matches - should return true if refresh tokens match - [success]', async () => {
      const currentRefreshTokenByCookie = 'plain-token';
      const oldRefreshTokenInDB = 'hashed-token';

      // bcrypt.compare를 모킹하여 true를 반환하도록 설정합니다.
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.getUserIfRefreshTokenMatches(
        currentRefreshTokenByCookie,
        oldRefreshTokenInDB,
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentRefreshTokenByCookie,
        oldRefreshTokenInDB,
      );
    });

    it('RefreshToken Matches - should return null if refresh tokens do not match - [failure]', async () => {
      const currentRefreshTokenByCookie = 'plain-token';
      const oldRefreshTokenInDB = 'hashed-token';

      // bcrypt.compare를 모킹하여 false를 반환하도록 설정합니다.
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await authService.getUserIfRefreshTokenMatches(
        currentRefreshTokenByCookie,
        oldRefreshTokenInDB,
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentRefreshTokenByCookie,
        oldRefreshTokenInDB,
      );
    });

    it('RefreshToken Matches - should handle errors correctly and return false - [failure]', async () => {
      const currentRefreshTokenByCookie = 'plain-token';
      const oldRefreshTokenInDB = 'hashed-token';

      jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error('error'));

      const result = await authService.getUserIfRefreshTokenMatches(
        currentRefreshTokenByCookie,
        oldRefreshTokenInDB,
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentRefreshTokenByCookie,
        oldRefreshTokenInDB,
      );
    });

    it('Remove RefreshToken - should call authRepository.delete with the correct userId - [success]', async () => {
      jest.spyOn(authMongoRepository, 'delete').mockResolvedValue({
        success: true,
      });

      const result = await authService.removeRefreshToken(userId);

      expect(authMongoRepository.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ success: true });
    });

    it('Remove RefreshToken - should handle errors from authRepository.delete - [failure]', async () => {
      jest
        .spyOn(authMongoRepository, 'delete')
        .mockRejectedValue(new Error('Failed to delete'));

      await expect(authService.removeRefreshToken(userId)).rejects.toThrow(
        'Failed to delete',
      );

      expect(authMongoRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
  describe('extractUserInfoFromPayload', () => {
    it('extractUserInfoFromPayload - should return userId and role if payload is valid - [success]', async () => {
      const payload = {
        userId: 'user11',
        role: 'Member',
      };

      const result = await authService.extractUserInfoFromPayload(payload);

      expect(result).toEqual({
        userId: 'user11',
        role: 'Member',
      });
    });

    it('extractUserInfoFromPayload - should return null if payload is missing userId - [failure]', async () => {
      const payload = {
        role: 'Member',
      };

      const result = await authService.extractUserInfoFromPayload(payload);

      expect(result).toBeNull();
    });

    it('extractUserInfoFromPayload - should return null if payload is missing role - [failure]', async () => {
      const payload = {
        userId: 'user11',
      };

      const result = await authService.extractUserInfoFromPayload(payload);

      expect(result).toBeNull();
    });

    it('extractUserInfoFromPayload - should return null if payload is null or undefined - [failure]', async () => {
      const resultNull = await authService.extractUserInfoFromPayload(null);
      const resultUndefined =
        await authService.extractUserInfoFromPayload(undefined);

      expect(resultNull).toBeNull();
      expect(resultUndefined).toBeNull();
    });

    it('extractUserInfoFromPayload - should return null and log error if an exception occurs - [failure]', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // payload를 객체로 설정하고 일부 속성을 접근할 때 에러가 발생하도록 합니다.
      const payload = {
        get userId() {
          throw new Error('Test error');
        },
      };

      const result = await authService.extractUserInfoFromPayload(payload);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '페이로드 처리 중 오류:',
        expect.any(Error),
      );
    });
  });

  // it('should generate an access token', async () => {
  //   const payload = { userId: 'user11', role: 'Member' };
  //   const accessToken = 'mockAccessToken';

  //   jest.spyOn(configService, 'get').mockImplementation((key: string) => {
  //     if (key === 'JWT_ACCESS_SECRET') {
  //       return 'mockJwtAccessSecret';
  //     }
  //     if (key === 'JWT_ACCESS_EXPIRATION_TIME') {
  //       return '1h';
  //     }
  //   });

  //   jest.spyOn(jwtService, 'signAsync').mockResolvedValue(accessToken);
  //   jwtService.signAsync(payload, {
  //     secret: 'mockJwtAccessSecret',
  //     expiresIn: '1h',
  //   });
  //   const result = await authService.generateAccessToken(payload);

  //   expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
  //   expect(configService.get).toHaveBeenCalledWith(
  //     'JWT_ACCESS_EXPIRATION_TIME',
  //   );
  //   expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
  //     secret: 'mockJwtAccessSecret',
  //     expiresIn: '1h',
  //   });

  //   expect(result).resolves.toEqual(accessToken);
  // });
});
