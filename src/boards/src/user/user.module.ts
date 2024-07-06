import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { AuthService } from './../auth/auth.service';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { AuthMongoRepository } from '../auth/auth.repository';
import { forwardRef } from '@nestjs/common';

import { User, UserSchema } from '../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './../auth/auth.module';

import {
  RefreshToken,
  RefreshTokenSchema,
} from './../schemas/refresh-token.schema';
@Module({
  imports: [
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
    ]),
  ],

  controllers: [UserController],
  providers: [
    AuthService,
    UserService,
    AuthMongoRepository,
    UserMongoRepository,
  ],
})
export class UserModule {}
