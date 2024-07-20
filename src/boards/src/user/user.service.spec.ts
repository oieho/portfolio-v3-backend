import * as mongoose from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userMongoRepository: UserMongoRepository;

  afterEach(async () => {
    jest.restoreAllMocks(); // 모든 모의(Mock) 함수 복구
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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
            findByUserIdAndUpdate: jest.fn(),
            saveUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userMongoRepository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register and modify', () => {
    let userDto: UserDto;
    let userId: string;

    beforeEach(() => {
      userId = 'user11';
      userDto = {
        userId: 'user11',
        password: process.env.USER11_PASSWORD,
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      };
    });

    it('should throw an error if user already exists', async () => {
      jest
        .spyOn(userMongoRepository, 'findUser')
        .mockResolvedValue(userDto.userId);

      await expect(service.register(userDto)).rejects.toThrow(
        new HttpException('해당 사용자가 이미 존재합니다.', 400),
      );
    });

    it('should modify user successfully', async () => {
      jest.spyOn(userMongoRepository, 'findUser').mockResolvedValue(userDto);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest
        .spyOn(bcrypt, 'hashSync')
        .mockReturnValue(process.env.USER11_PASSWORD);
      jest
        .spyOn(userMongoRepository, 'findByUserIdAndUpdate')
        .mockResolvedValue({
          ...userDto,
        });

      const result = await service.modifyUserByUserId(userId, userDto);

      expect(result.userId).toEqual('user11');
      expect(result.password).toEqual(process.env.USER11_PASSWORD);
      expect(result).toEqual(
        expect.objectContaining({
          email: 'user11@oieho.com',
          joinDate: expect.any(Date),
          modDate: expect.any(Date),
          name: '사용자11',
          password: process.env.USER11_PASSWORD,
          role: 'member',
          socialMedia: 'LOCAL',
          userId: 'user11',
        }),
      );
    });
  });

  describe('get User Entity and User Information', () => {
    let userId: string;
    let mockUser: any;
    let resultUser: any;

    beforeEach(() => {
      userId = 'user11';
      mockUser = {
        _id: '668e17905511502799766d3d',
        userId: 'user11',
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: '2024-07-10T05:09:36.712Z',
        modDate: '2024-07-10T05:09:36.712Z',
        __v: 0,
      };
      resultUser = {
        _id: '668e17905511502799766d3d',
        userId: 'user11',
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: '2024-07-10T05:09:36.712Z',
        modDate: '2024-07-10T05:09:36.712Z',
        __v: 0,
      };

      jest
        .spyOn(userMongoRepository, 'findUser')
        .mockImplementation(async (id: string) => {
          if (id === userId) {
            return mockUser;
          } else {
            return null;
          }
        });
    });

    it('should return user entity if userId matches some entity', async () => {
      const result = await service.findUser(userId);
      expect(result).toEqual(resultUser);
    });

    it('should return userInfo(entity) if userId matches some entity', async () => {
      const result = await service.findUser(userId);
      expect(result).toEqual(resultUser);
    });
  });

  it('should return userInfo(entity) if userId matches some entity', async () => {
    const userId = 'user11';
    const mockUser = {
      _id: '668e17905511502799766d3d',
      userId: 'user11',
      email: 'user11@oieho.com',
      name: '사용자11',
      socialMedia: 'LOCAL',
      role: 'member',
      joinDate: '2024-07-10T05:09:36.712Z',
      modDate: '2024-07-10T05:09:36.712Z',
      __v: 0,
    };
    const resultUser = {
      _id: '668e17905511502799766d3d',
      userId: 'user11',
      email: 'user11@oieho.com',
      name: '사용자11',
      socialMedia: 'LOCAL',
      role: 'member',
      joinDate: '2024-07-10T05:09:36.712Z',
      modDate: '2024-07-10T05:09:36.712Z',
      __v: 0,
    };
    jest
      .spyOn(userMongoRepository, 'findUser')
      .mockImplementation(async (userId: string) => {
        if (userId === 'user11') {
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
      .spyOn(userMongoRepository, 'findUserId')
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
});
