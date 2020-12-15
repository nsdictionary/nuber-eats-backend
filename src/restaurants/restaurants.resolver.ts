import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { UpdateResult } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('data') dto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(dto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(@Args() dto: UpdateRestaurantDto): Promise<boolean> {
    try {
      const result: UpdateResult = await this.restaurantService.updateRestaurant(
        dto,
      );
      return result.affected > 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
