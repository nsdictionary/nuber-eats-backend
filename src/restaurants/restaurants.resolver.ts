import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entitiy";
import { RestaurantService } from "./restaurants.service";
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from "./dtos/create-restaurant.dto";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/entities/user.entity";
import { Role } from "../auth/role.decorator";
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from "./dtos/edit-restaurant.dto";
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from "./dtos/delete-restaurant.dto";
import { Category } from "./entities/category.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import {
  AllRestaurantsInput,
  AllRestaurantsOutput,
} from "./dtos/all-restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from "./dtos/search-restaurant.dto";

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

  @Mutation(() => EditRestaurantOutput)
  @Role(["Owner"])
  editRestaurant(
    @AuthUser() owner: User,
    @Args("data") data: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, data);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Role(["Owner"])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args("data") data: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, data);
  }

  @Query(() => AllRestaurantsOutput)
  restaurants(
    @Args("data") data: AllRestaurantsInput
  ): Promise<AllRestaurantsOutput> {
    return this.restaurantService.allRestaurants(data);
  }

  @Query(() => RestaurantOutput)
  restaurant(@Args("data") data: RestaurantInput): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(data);
  }

  @Query(() => SearchRestaurantOutput)
  searchRestaurant(
    @Args("data") data: SearchRestaurantInput
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(data);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurant(category);
  }

  @Query(() => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(() => CategoryOutput)
  category(@Args("data") data: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(data);
  }
}
