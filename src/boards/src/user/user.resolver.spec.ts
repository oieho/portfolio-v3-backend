import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;

  const mockUserService = {
    findUserByCriteria: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

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
  describe('findUserByCriteria', () => {
    let findUserByCriteriaSpy: jest.SpyInstance;

    beforeEach(() => {
      // 모의 함수 호출을 감시합니다.
      findUserByCriteriaSpy = jest.spyOn(mockUserService, 'findUserByCriteria');
    });

    afterEach(() => {
      // 모든 모의 함수 호출 기록을 초기화합니다.
      jest.clearAllMocks();
    });

    it('should return the user name if user exists', async () => {
      // mockUserService.findUserByCriteria에서 name으로 필터링하여 mockUser를 반환하도록 설정합니다.
      mockUserService.findUserByCriteria.mockImplementation(({ name }) => {
        return name === '사용자11' ? mockUser : null;
      });

      // resolver.findUserName 호출 결과가 mockUser.name과 같은지 확인합니다.
      expect(await resolver.nameChk('사용자11')).toEqual(mockUser.name);

      // 모의 함수 호출 검증
      expect(findUserByCriteriaSpy).toHaveBeenCalledWith({ name: '사용자11' });
      expect(findUserByCriteriaSpy).toHaveBeenCalledTimes(1);
    });

    it('should return the user email if user exists', async () => {
      // mockUserService.findUserByCriteria에서 email로 필터링하여 mockUser를 반환하도록 설정합니다.
      mockUserService.findUserByCriteria.mockImplementation(({ email }) => {
        return email === 'user11@oieho.com' ? mockUser : null;
      });

      // resolver.findUserEmail 호출 결과가 mockUser.email과 같은지 확인합니다.
      expect(await resolver.emailChk('user11@oieho.com')).toEqual(
        mockUser.email,
      );

      // 모의 함수 호출 검증
      expect(findUserByCriteriaSpy).toHaveBeenCalledWith({
        email: 'user11@oieho.com',
      });
      expect(findUserByCriteriaSpy).toHaveBeenCalledTimes(1);
    });

    it('should return a user if both name and email match', async () => {
      // mockUserService.findUserByCriteria에서 name과 email로 필터링하여 mockUser를 반환하도록 설정합니다.
      mockUserService.findUserByCriteria.mockImplementation(
        ({ name, email }) => {
          return name === '사용자11' && email === 'user11@oieho.com'
            ? mockUser
            : null;
        },
      );

      // resolver.findUserNameAndUserEmail 호출 결과가 mockUser와 같은지 확인합니다.
      expect(
        await resolver.ifMatchNameAndEmail('사용자11', 'user11@oieho.com'),
      ).toEqual(mockUser);

      // 모의 함수 호출 검증
      expect(findUserByCriteriaSpy).toHaveBeenCalledWith({
        name: '사용자11',
        email: 'user11@oieho.com',
      });
      expect(findUserByCriteriaSpy).toHaveBeenCalledTimes(1);
    });
  });
});
