import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entitiy";
import { RestaurantService } from "./restaurants.service";
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from "./dtos/create-restaurant.dto";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/entities/user.entity";
import { Role } from "../auth/role.decorator";

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(["Owner"])
  createRestaurant(
    @AuthUser() authUser: User,
    @Args("data") data: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, data);
  }
}
