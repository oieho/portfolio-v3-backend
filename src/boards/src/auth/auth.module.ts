import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './../user/user.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthMongoRepository } from './auth.repository';
import { UserMongoRepository } from './../user/user.repository';
import { RefreshTokenSchema } from './../schemas/refresh-token.schema';
import { UserSchema } from './../schemas/user.schema';
import { UserModule } from './../user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({}),
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
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: 'RefreshToken', schema: RefreshTokenSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    ConfigService,
    AuthService,
    UserService,
    JwtAuthGuard,
    AuthMongoRepository,
    UserMongoRepository,
  ],
})
export class AuthModule {}
