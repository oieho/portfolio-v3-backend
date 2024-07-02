import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { User, UserDocument } from '../schemas/user.schema';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserMongoRepository;

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
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {}, // User 모델의 모의 객체를 설정합니다.
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
