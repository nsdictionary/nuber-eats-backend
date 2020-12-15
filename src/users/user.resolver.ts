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
  async createAccount(
    @Args('data') data: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const error = await this.usersService.createAccount(data);
      if (error) {
        return { ok: false, error };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
