import { Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entitiy';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.getAll();
  }
}
