import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserMongoRepository } from './user.repository';
import { User, UserSchema } from '../schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './../schemas/refresh-token.schema';
@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],

  controllers: [UserController],
  providers: [UserService, UserMongoRepository],
})
export class UserModule {}
