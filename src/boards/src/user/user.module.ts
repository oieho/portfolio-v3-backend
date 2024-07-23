import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { AuthService } from './../auth/auth.service';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { AuthMongoRepository } from '../auth/auth.repository';
import { forwardRef } from '@nestjs/common';
import { MailerModule, MAILER_OPTIONS } from '@nestjs-modules/mailer';

import { User, UserSchema } from '../schemas/user.schema';
import { RecoverPass, RecoverPassSchema } from '../schemas/recoverPass.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './../auth/auth.module';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './../schemas/refresh-token.schema';
import { UserResolver } from './user.resolver';
import { EmailService } from '../email/email.service';
import { RedisModule } from '../redis/redis.module';
import { MailerService } from '@nestjs-modules/mailer';

@Module({
  imports: [
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
        },
        refreshSecret: configService.get<string>('JWT_REFRESH_SECRET'), // 추가
        refreshSignOptions: {
          // 추가
          expiresIn: configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: RecoverPass.name, schema: RecoverPassSchema },
    ]),
  ],

  controllers: [UserController],
  providers: [
    AuthService,
    UserService,
    ConfigService,
    EmailService,
    MailerService,
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
    AuthMongoRepository,
    UserMongoRepository,
    UserResolver,
  ],
})
export class UserModule {}
