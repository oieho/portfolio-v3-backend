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
  //   const sender = '사용자22';
  //   const subject = '테스트 제목';
  //   const emailAddress = 'user22@oieho.com';
  //   const content = '테스트 본문';
  //   const file = undefined;
  //   const files = [];
  //   let attachments = [];

  //   // file이 존재하면 배열에 추가
  //   if (file) {
  //     attachments.push({
  //       filename: file.originalname,
  //       content: file.buffer,
  //     });
  //   }

  //   // files가 존재하면 배열에 추가
  //   if (files && files.length > 0) {
  //     attachments = [
  //       ...attachments,
  //       ...files.map((f) => ({
  //         filename: f.originalname,
  //         content: f.buffer,
  //       })),
  //     ];
  //   }

  //   const mailOptions = {
  //     to: 'oiehomail@gmail.com',
  //     subject:
  //       subject + '   -   보낸사람 : ' + sender + '(' + emailAddress + ')',
  //     text: '테스트 본문',
  //     attachments: attachments.length > 0 ? attachments : [],
  //   };

  //   // sendMail 함수의 mockImplementation 설정
  //   jest
  //     .spyOn(mailerService, 'sendMail')
  //     .mockImplementation(async (sendMailOptions) => {
  //       return Promise.resolve({ message: 'Email sent successfully!' });
  //     });

  //   const result = await service.sendAnEmail(
  //     sender,
  //     subject,
  //     emailAddress,
  //     content,
  //     file,
  //     files,
  //   );

  //   // sendAnEmail 메서드가 { message: "Email sent successfully!" }를 반환하는지 확인합니다.
  //   expect(result).toEqual({ message: 'Email sent successfully!' });
  // });
});
