import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RefreshTokenSchema } from './schemas/refresh-token.schema';
import { UserSchema } from './schemas/user.schema';
import { EmailModule } from './email/email.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schemas/graphQLschema.gql'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
    MongooseModule.forFeature([
      { name: 'RefreshToken', schema: RefreshTokenSchema },
      { name: 'User', schema: UserSchema },
    ]),
    EmailModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
