import { Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  UserDto,
  IdCheckResultsInEmail,
  IdAndEmailCheckSendsEmail,
} from './dto/user.dto';

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Resolver((of) => UserDto)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Query((returns) => Boolean)
  async nameChk(@Args('name') name: string): Promise<boolean> {
    const result = await this.userService.findUserByCriteria({ name });
    return result ? true : false;
  }

  @Query((returns) => Boolean)
  async emailChk(@Args('email') email: string): Promise<boolean> {
    const result = await this.userService.findUserByCriteria({ email });
    return result ? true : false;
  }

  @Query((returns) => Boolean)
  async ifMatchNameAndEmail(
    @Args('name') name: string,
    @Args('email') email: string,
  ): Promise<boolean> {
    const result = await this.userService.findUserByCriteria({ name, email });
    return result ? true : false;
  }

  @Query(() => IdCheckResultsInEmail)
  async idChkReturnEmail(
    @Args('userId') userId: string,
  ): Promise<IdCheckResultsInEmail> {
    const extractedEmail = await this.userService.findEmailByUserId(userId);
    if (extractedEmail) {
      const existsEmail = extractedEmail !== null;

      return { extractedEmail, existsEmail };
    } else {
      throw new NotFoundException('UserID not found!');
    }
  }

  @Query(() => IdAndEmailCheckSendsEmail)
  async idAndEmailChkSendEmailToFindPassword(
    @Args('userId') userId: string,
    @Args('email') email: string,
  ): Promise<IdAndEmailCheckSendsEmail> {
    const validEmail = await this.userService.findUserByCriteria({
      userId,
      email,
    });
    let token;

    if (validEmail === null) {
      throw new NotFoundException(
        'The provided ID and email are not appropriate',
      );
    } else {
      try {
        token = await this.userService.saveRecoveryPassToken();
        this.emailService.sendEmailToFindThePassword(email, token);
      } catch (e) {
        throw new NotFoundException(e + ' ' + 'Internal Server Error');
      }

      return { token, sentEmail: true };
    }
  }
}
