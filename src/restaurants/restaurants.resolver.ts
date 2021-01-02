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
import { RestaurantsService } from "./restaurants.service";
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
import { Dish } from "./entities/dish.entity";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { MyRestaurantsOutput } from "./dtos/my-restaurants.dto";

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

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

  @Query(() => MyRestaurantsOutput)
  @Role(["Owner"])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(owner);
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
  constructor(private readonly restaurantService: RestaurantsService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
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

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(() => CreateDishOutput)
  @Role(["Owner"])
  createDish(
    @AuthUser() owner: User,
    @Args("data") data: CreateDishInput
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, data);
  }

  @Mutation(() => EditDishOutput)
  @Role(["Owner"])
  editDish(
    @AuthUser() owner: User,
    @Args("data") data: EditDishInput
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, data);
  }

  @Mutation(() => DeleteDishOutput)
  @Role(["Owner"])
  deleteDish(
    @AuthUser() owner: User,
    @Args("data") data: DeleteDishInput
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, data);
  }
}
