import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';
import { UserMongoRepository } from '../user/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserSchema } from '../schemas/user.schema';

describe('EmailService', () => {
  let userService: UserService;
  let service: EmailService;
  let mailerService: MailerService;
  let userMongoRepository: UserMongoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        UserMongoRepository,
      ],
      imports: [
        MulterModule.register({
          dest: './uploads',
        }),
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
        MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    userMongoRepository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should send an email successfully without attachments', async () => {
  //   const sendMailSpy = await jest
  //     .spyOn(mailerService, 'sendMail')
  //     .mockResolvedValue(undefined);

  //   const sender = '사용자22';
  //   const subject = '테스트 제목';
  //   const senderEmail = 'user22@oieho.com';
  //   const text = '테스트 본문';
  //   const file: Express.Multer.File = undefined;
  //   const files: Express.Multer.File[] = [];

  //   await service.sendEmail(sender, subject, senderEmail, text, file, files);

  //   expect(sendMailSpy).toHaveBeenCalledWith({
  //     to: 'oiehomail@gmail.com',
  //     subject: '테스트 제목   -   보낸사람 : 사용자22(user22@oieho.com)',
  //     text: '테스트 본문',
  //     attachments: [],
  //   });
  // });
});
