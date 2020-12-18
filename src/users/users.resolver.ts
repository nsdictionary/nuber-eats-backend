import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { AuthUser } from "../auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { CoreOutput } from "../common/dtos/output.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { Role } from "../auth/role.decorator";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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
  @Role(["Any"])
  me(@AuthUser() authUser: User): User {
    return authUser;
  }

  @Query(() => UserProfileOutput)
  @Role(["Any"])
  userProfile(
    @Args() { userId }: UserProfileInput
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userId);
  }

  @Mutation(() => EditProfileOutput)
  @Role(["Any"])
  editProfile(
    @AuthUser() authUser: User,
    @Args("data") data: EditProfileInput
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, data);
  }

  @Mutation(() => CoreOutput)
  @Role(["Any"])
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
