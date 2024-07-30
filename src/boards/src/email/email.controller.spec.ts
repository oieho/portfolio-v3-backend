import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';
import { UserMongoRepository } from '../user/user.repository';
import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer';
import { Readable } from 'stream';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schemas/user.schema';

describe('EmailController', () => {
  let controller: EmailController;
  let userService: UserService;
  let emailService: EmailService;
  let userMongoRepository: UserMongoRepository;

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        UserService,
        EmailService,
        UserMongoRepository,
        {
          provide: getModelToken('RecoverPass'), // 'RecoverPass'는 Mongoose 모델 이름입니다
          useValue: { recoveryPassToken: jest.fn() }, // 모의 객체 설정
        },
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

    controller = module.get<EmailController>(EmailController);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    userMongoRepository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  afterEach(() => {
    // 테스트 이후에 업로드된 파일 삭제 등의 정리 작업이 필요하다면 추가할 수 있습니다.
  });

  it('sendEmail - should send email successfully - [success]', async () => {
    const sender = 'test@oieho.com';
    const subject = 'Test Email';
    const emailAddress = 'admin@oieho.com';
    const content = 'This is a test email content';

    // 파일 업로드 예시를 위한 가상의 파일 생성
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 100,
      buffer: Buffer.from('test file content'),
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };

    // 파일 업로드 예시를 위한 가상의 파일 배열 생성
    const files: Express.Multer.File[] = [
      {
        fieldname: 'files',
        originalname: 'test1.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 200,
        buffer: Buffer.from('test file content 1'),
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      },
      {
        fieldname: 'files',
        originalname: 'test2.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 150,
        buffer: Buffer.from('test file content 2'),
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      },
    ];

    jest
      .spyOn(emailService, 'sendAnEmail')
      .mockResolvedValueOnce(Promise.resolve());
    const result = await controller.sendEmail(
      file,
      files,
      sender,
      subject,
      emailAddress,
      content,
    );

    expect(result).toEqual({ message: 'Email sent successfully!' });
  });

  it('findId - should send email by userEmail to get userID by userName successfully - [success]', async () => {
    const userName = '사용자22';
    const userEmail = 'user22@oieho.com';

    jest
      .spyOn(emailService, 'sendEmailToFindTheID')
      .mockResolvedValueOnce(Promise.resolve());

    const result = await controller.findId(userName, userEmail);

    expect(result).toEqual({
      message: 'By sending the email, find the ID. Email sent successfully!',
    });
  });
});
