import * as mongoose from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserDocument } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserMongoRepository;
  let mongoServer: MongoMemoryServer;
  let userModel;

  afterEach(async () => {
    jest.restoreAllMocks(); // 모든 모의(Mock) 함수 복구
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: UserMongoRepository,
          useValue: {
            // UserMongoRepository의 메서드들에 대한 모의 객체를 설정합니다.
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUser: jest.fn(),
            findUserId: jest.fn(),
            findUserName: jest.fn(),
            findUserEmail: jest.fn(),
            findUserNameAndUserEmail: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByUserIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserMongoRepository>(UserMongoRepository);
    userModel = module.get(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true if user exists with given name and email', async () => {
    const name = '사용자11';
    const email = 'user11@oieho.com';

    // userRepository.findUserNameAndUserEmail 메서드를 spyOn하여 모의(Mock) 함수로 대체
    const findSpy = jest
      .spyOn(userRepository, 'findUserNameAndUserEmail')
      .mockResolvedValue(name === '사용자11' && email === 'user11@oieho.com');

    // 서비스 메서드 호출
    const result = await service.existsByUserNameAndUserEmail(name, email);

    expect(result).toBe(true);

    // 호출된 모의(Mock) 함수 검증
    expect(findSpy).toHaveBeenCalledWith(name, email);
    expect(findSpy).toHaveBeenCalledTimes(1);
  });

  it('should return user entity if userId matches some entity', async () => {
    const userId = 'user2';
    const mockUser = {
      _id: '668e17905511502799766d22',
      userId: 'user2',
      email: 'user2@oieho.com',
      name: '사용자2',
      socialMedia: 'LOCAL',
      role: 'member',
      joinDate: '2024-07-10T05:09:36.256Z',
      modDate: '2024-07-10T05:09:36.256Z',
      __v: 0,
    };
    const resultUser = {
      _id: '668e17905511502799766d22',
      userId: 'user2',
      email: 'user2@oieho.com',
      name: '사용자2',
      socialMedia: 'LOCAL',
      role: 'member',
      joinDate: '2024-07-10T05:09:36.256Z',
      modDate: '2024-07-10T05:09:36.256Z',
      __v: 0,
    };
    jest
      .spyOn(userRepository, 'findUser')
      .mockImplementation(async (userId: string) => {
        if (userId === 'user2') {
          return mockUser;
        } else {
          return null;
        }
      });

    const result = await service.findUser(userId);

    expect(result).toEqual(resultUser);
  });

  it('should return userId if userId exists', async () => {
    const name = '사용자22';
    const mockUser = 'user22';

    jest
      .spyOn(userRepository, 'findUserId')
      .mockImplementation(async (name) => {
        if (name === '사용자22') {
          return mockUser;
        } else {
          return null;
        }
      });

    const result = await service.findUserId(name);
    expect(result).toBe(mockUser);
  });

  it('should return true if user email exists', async () => {
    const email = 'user123@oieho.com';
    const mockUser = { email: 'user123@oieho.com' };
    jest.spyOn(userRepository, 'findUserEmail').mockResolvedValue(mockUser);

    const result = await service.findUserEmail(email);
    expect(result).toBe(true);
  });

  it('should return true if user name exists', async () => {
    const name = '사용자22';
    const mockUser = { name: '사용자22' };
    jest.spyOn(userRepository, 'findUserName').mockResolvedValue(mockUser);

    const result = await service.findUserName(name);
    expect(result).toBe(true);
  });
});
