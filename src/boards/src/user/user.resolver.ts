import { Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Resolver((of) => UserDto)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
}
