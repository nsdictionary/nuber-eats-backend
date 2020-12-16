import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entitiy";
import { UsersService } from "./users.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { AuthUser } from "../auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { UpdateResult } from "typeorm";
import { CoreOutput } from "../common/dtos/output.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args("data") data: CreateAccountInput
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(data);
  }

  @Mutation(() => LoginOutput)
  login(@Args("data") data: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(data);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @UseGuards(AuthGuard)
  @Query(() => UserProfileOutput)
  userProfile(
    @Args() { userId }: UserProfileInput
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  editProfile(
    @AuthUser() authUser: User,
    @Args("data") data: EditProfileInput
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, data);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => CoreOutput)
  deleteUser(@AuthUser() authUser: User): Promise<CoreOutput> {
    return this.usersService.deleteUser(authUser.id);
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(
    @Args("data") { code }: VerifyEmailInput
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
