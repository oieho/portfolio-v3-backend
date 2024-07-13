// email.module.ts
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { UserService } from '../user/user.service';
import { UserMongoRepository } from './../user/user.repository';
import { MulterModule } from '@nestjs/platform-express';
import { UserSchema } from './../schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot(), // 기본적으로 .env 파일을 로드합니다.
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
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MulterModule.register({
      dest: './uploads', // 파일이 저장될 경로
    }),
  ],
  providers: [UserService, UserMongoRepository, EmailService],
  exports: [MailerModule],
  controllers: [EmailController], // 필요한 경우 MailerModule과 JwtModule를 외부에서 사용할 수 있도록 export
})
export class EmailModule {}
