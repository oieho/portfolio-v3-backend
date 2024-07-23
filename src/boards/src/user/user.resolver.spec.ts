import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { MailerModule, MAILER_OPTIONS } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schemas/user.schema';
import { RecoverPassSchema } from '../schemas/recoverPass.schema';
import { UserMongoRepository } from './user.repository';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;
  let emailService: EmailService;

  const mockUserService = {
    findUserByCriteria: jest.fn(),
    findEmailByUserId: jest.fn(),
    saveRecoveryPassToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule,
        MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema },
          { name: 'RecoverPass', schema: RecoverPassSchema },
        ]),
        MailerModule.forRoot({
          transport: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          },
        }),
      ],
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
        UserMongoRepository,
        {
          provide: MAILER_OPTIONS,
          useValue: {
            transport: {
              host: 'smtp.example.com',
              port: 587,
              auth: {
                user: 'user@example.com',
                pass: 'password',
              },
            },
            defaults: {
              from: '"No Reply" <no-reply@example.com>',
            },
          },
        },
        EmailModule,
        EmailService,
        MailerService,
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
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
    role: 'Member',
    joinDate: '2024-07-10T05:09:36.712Z',
    modDate: '2024-07-10T05:09:36.712Z',
    __v: 0,
  };
  const username = '사용자11';
  const email = 'user11@oieho.com';
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

    it('nameChk - should return the user name if user exists', async () => {
      // mockUserService.findUserByCriteria에서 name으로 필터링하여 mockUser를 반환하도록 설정합니다.
      mockUserService.findUserByCriteria.mockImplementation(({ name }) => {
        return name === username ? mockUser : null;
      });

      // resolver.findUserName 호출 결과가 mockUser.name과 같은지 확인합니다.
      expect(await resolver.nameChk(username)).toBe(true);

      // 모의 함수 호출 검증
      expect(findUserByCriteriaSpy).toHaveBeenCalledWith({ name: username });
      expect(findUserByCriteriaSpy).toHaveBeenCalledTimes(1);
    });

    it('emailChk - should return the user email if user exists', async () => {
      // mockUserService.findUserByCriteria에서 email로 필터링하여 mockUser를 반환하도록 설정합니다.
      mockUserService.findUserByCriteria.mockImplementation(({ email }) => {
        return email === email ? mockUser : null;
      });

      // resolver.findUserEmail 호출 결과가 mockUser.email과 같은지 확인합니다.
      expect(await resolver.emailChk(email)).toBe(true);

      // 모의 함수 호출 검증
      expect(findUserByCriteriaSpy).toHaveBeenCalledWith({
        email: email,
      });
      expect(findUserByCriteriaSpy).toHaveBeenCalledTimes(1);
    });

    it('ifMatchNameAndEmail - should return a user if both name and email match', async () => {
      // mockUserService.findUserByCriteria에서 name과 email로 필터링하여 mockUser를 반환하도록 설정합니다.
      mockUserService.findUserByCriteria.mockImplementation(
        ({ name, email }) => {
          return name === username && email === email ? mockUser : null;
        },
      );

      // resolver.findUserNameAndUserEmail 호출 결과가 mockUser와 같은지 확인합니다.
      expect(await resolver.ifMatchNameAndEmail(username, email)).toBe(true);

      // 모의 함수 호출 검증
      expect(findUserByCriteriaSpy).toHaveBeenCalledWith({
        name: username,
        email: email,
      });
      expect(findUserByCriteriaSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('idChkReturnEmail - should return email and existsEmail as true when email is found', async () => {
    const userId = 'user11';

    // Mock implementation to return email based on userId
    jest
      .spyOn(userService, 'findEmailByUserId')
      .mockImplementation((userId: string) => {
        return Promise.resolve(userId === 'user11' ? mockUser.email : null);
      });

    const result = await resolver.idChkReturnEmail(userId);

    expect(result).toEqual({
      extractedEmail: mockUser.email,
      existsEmail: true,
    });
    expect(userService.findEmailByUserId).toHaveBeenCalledWith(userId);
  });

  it('idAndEmailChkSendEmailToFindPassword - should return token and sentEmail as true when valid email is provided', async () => {
    const userId = '사용자11';
    const mockToken = '1df0654f1-c4b2-4aa2-ba62-6becd7f997ba';
    const token = '1df0654f1-c4b2-4aa2-ba62-6becd7f997ba';

    mockUserService.findUserByCriteria.mockImplementation(
      ({ userId, email }) => {
        return userId === userId && email === email ? mockUser : null;
      },
    );
    jest
      .spyOn(userService, 'saveRecoveryPassToken')
      .mockResolvedValue(mockToken);
    jest
      .spyOn(emailService, 'sendEmailToFindThePassword')
      .mockResolvedValue(undefined);

    const result = await resolver.idAndEmailChkSendEmailToFindPassword(
      userId,
      email,
    );

    expect(result).toEqual({ token, sentEmail: true });
    expect(userService.findUserByCriteria).toHaveBeenCalledWith({
      userId,
      email,
    });
    expect(userService.saveRecoveryPassToken).toHaveBeenCalled();
    expect(emailService.sendEmailToFindThePassword).toHaveBeenCalledWith(
      email,
      token,
    );
  });
});
