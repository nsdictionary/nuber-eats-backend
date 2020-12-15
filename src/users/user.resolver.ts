import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entitiy";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args("data") data: CreateAccountInput
  ): Promise<CreateAccountOutput> {
    try {
      return this.usersService.createAccount(data);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args("data") data: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(data);
    } catch (error) {
      return { ok: false, error };
    }
  }

  @Query(() => User)
  me() {}
}
