import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { HttpException, NotFoundException } from '@nestjs/common';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UserSchema } from '../schemas/user.schema';
import { RecoverPassSchema } from '../schemas/recoverPass.schema';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<any>;
  let recoverPassModel: Model<any>;
  let userMongoRepository: UserMongoRepository;

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'RecoverPass', schema: RecoverPassSchema },
        ]),
      ],
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
        },
        {
          provide: getModelToken('RecoverPass'), // 'RecoverPass'는 Mongoose 모델 이름입니다
          useValue: { recoveryPassToken: jest.fn() }, // 모의 객체 설정
        },
        {
          provide: UserMongoRepository,
          useValue: {
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
            hashSync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<any>>(getModelToken('User'));
    recoverPassModel = module.get<Model<any>>(getModelToken('RecoverPass'));
    userMongoRepository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockUser = {
    _id: '668e17905511502799766d3d',
    userId: 'user11',
    email: 'user11@oieho.com',
    name: '사용자11',
    socialMedia: 'LOCAL',
    role: 'Member',
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
    role: 'Member',
    joinDate: '2024-07-10T05:09:36.712Z',
    modDate: '2024-07-10T05:09:36.712Z',
    __v: 0,
  };

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
        role: 'Member',
        joinDate: new Date(),
        modDate: new Date(),
      };
    });

    it('createUser - should create a user and return the user dto', async () => {
      jest.spyOn(userMongoRepository, 'saveUser').mockResolvedValue(userDto);

      const result = await service.createUser(userDto);

      expect(userMongoRepository.saveUser).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(userDto);
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
          role: 'Member',
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

    it('should return userInfo(entity) if userId matches some entity', async () => {
      const userId = 'user11';
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

  describe('findUserByCriteria', () => {
    it('should return a user if found', async () => {
      // 테스트 데이터
      const mockUser = {
        email: 'user11@oieho.com',
        userId: 'user11',
        role: 'Member',
      };

      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockImplementation(() => {
          return {
            lean: jest.fn().mockResolvedValue(mockUser),
          } as any;
        });

      const result = await service.findUserByCriteria({
        email: mockUser.email,
        userId: mockUser.userId,
        role: mockUser.role,
      });

      // 결과를 검증합니다.
      expect(result).toEqual({
        email: resultUser.email,
        userId: resultUser.userId,
        role: resultUser.role,
      });

      expect(findOneSpy).toHaveBeenCalledWith({
        email: mockUser.email,
        userId: mockUser.userId,
        role: mockUser.role,
      });
    });
  });

  describe('findPasswordByToken', () => {
    const mockToken = '3080161f-6d21-4056-8c25-0fa1670d35e6';
    const resultToken = '3080161f-6d21-4056-8c25-0fa1670d35e6';
    it('should generate a token and save it using userRepository', async () => {
      (uuidv4 as jest.Mock).mockReturnValue(mockToken);

      const recoveryPassTokenSpy = jest
        .spyOn(userMongoRepository, 'recoveryPassToken')
        .mockResolvedValue(undefined);

      const result = await service.saveRecoveryPassToken();

      expect(result).toBe(resultToken);
      expect(recoveryPassTokenSpy).toHaveBeenCalledWith(mockToken);
    });
    it('qualifyByToken - should throw NotFoundException if token does not exist', async () => {
      jest.spyOn(recoverPassModel, 'findOne').mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValue(null),
        } as any;
      });

      await expect(service.qualifyByToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('qualifyByToken - should return success message if token exists', async () => {
      jest.spyOn(recoverPassModel, 'findOne').mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValue({ resetToken: mockToken }),
        } as any;
      });
      jest.spyOn(recoverPassModel, 'deleteOne').mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        } as any;
      });

      const result = await service.qualifyByToken(mockToken);

      expect(recoverPassModel.deleteOne).toHaveBeenCalledWith({
        resetToken: resultToken,
      });
      expect(recoverPassModel.deleteOne().exec()).resolves.toEqual({
        deletedCount: 1,
      });

      expect(result).toBe(
        '<html><body><h1>인증이 완료되었습니다.</h1><p>홈페이지로 돌아간 후 비밀번호를 변경하시기 바랍니다.</p></body></html>',
      );
    });

    it('verifyToken - should return true if token exists', async () => {
      jest.spyOn(recoverPassModel, 'findOne').mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValue({ resetToken: mockToken }),
        } as any;
      });
      const result = await service.verifyToken(mockToken);
      expect(result).toEqual(true);
    });

    it('removeRecoverPassToken - should call deleteOne with the correct token', async () => {
      jest.spyOn(recoverPassModel, 'deleteOne').mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        } as any;
      });

      await service.removeRecoverPassToken(mockToken);

      expect(recoverPassModel.deleteOne).toHaveBeenCalledWith({
        resetToken: resultToken,
      });
      expect(recoverPassModel.deleteOne().exec()).resolves.toEqual({
        deletedCount: 1,
      });
    });

    it('changePassword - should hash the password and call changePassword', async () => {
      const userId = 'user11';
      const password = '1';
      const hashedPassword =
        '$2b$10$quLKBi3quZhM.7NFNBfyw.KEL9WoC1HwaYFqLnlOcRWL0uVe5HDYu'; // hashed-password

      jest.spyOn(bcrypt, 'hashSync').mockReturnValue(hashedPassword);
      jest.spyOn(userModel, 'findOneAndUpdate').mockImplementation(() => {
        return {
          lean: jest.fn().mockResolvedValue(mockUser),
        } as any;
      });
      await service.changePassword(userId, password);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(password, 10);
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: userId },
        { password: hashedPassword },
      );
    });
  });
});
