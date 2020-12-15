import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entitiy';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(@Args('data') data: CreateAccountInput) {
    try {
      // await this.usersService.createUser(data);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
