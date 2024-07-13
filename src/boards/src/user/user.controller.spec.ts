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

describe('UserController', () => {
  let controller: UserController;
  let authService: AuthService;
  let userService: UserService;
  let userMongoRepository: UserMongoRepository;
  let userModel: any;

  beforeEach(async () => {
    const userModelMock = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true, // 전역으로 사용 가능하게 설정
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_ACCESS_SECRET'),
            signOptions: { expiresIn: '1h' },
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
          useValue: userModelMock,
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

    controller = module.get<UserController>(UserController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    userMongoRepository = module.get<UserMongoRepository>(UserMongoRepository);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('confirmName', () => {
    it('should return true if userName exists', async () => {
      const userName = '사용자1';

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
      const userEmail = 'user1@oieho.com';

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
      const userName = 'user11';
      const userEmail = 'user11@oieho.com';

      jest
        .spyOn(userService, 'existsByUserNameAndUserEmail')
        .mockImplementation(async (name: string, email: string) => {
          // name이 'user1'이고 email이 'user1@oieho.com'일 때만 true를 반환하도록 구현
          if (name === 'user11' && email === 'user11@oieho.com') {
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
