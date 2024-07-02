import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthMongoRepository } from './auth.repository';
import { UserMongoRepository } from '../user/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_ACCESS_SECRET, // JWT를 위한 시크릿 키 설정
          signOptions: { expiresIn: '1h' }, // 옵션 설정 (예: 만료 시간)
        }),
      ],
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
          useValue: {}, // RefreshToken 모델의 모의 객체 설정
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
