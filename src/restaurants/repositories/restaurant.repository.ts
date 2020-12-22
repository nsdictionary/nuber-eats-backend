import {
  EntityRepository,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from "typeorm";
import { Restaurant } from "../entities/restaurant.entitiy";
import { User } from "../../users/entities/user.entity";

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async findAndPaginate(
    page: number,
    offset: number,
    options?: FindManyOptions<Restaurant>
  ): Promise<{
    restaurants: Restaurant[];
    totalResults: number;
    totalPages: number;
  }> {
    const [restaurants, totalResults] = await this.findAndCount({
      skip: (page - 1) * offset,
      take: offset,
      order: { isPromoted: "DESC" },
      ...options,
    });

    return {
      restaurants,
      totalResults,
      totalPages: Math.ceil(totalResults / offset),
    };
  }

  async findAndValidateOwner(
    owner: User,
    restaurantId: number,
    options?: FindOneOptions<Restaurant>
  ): Promise<{ ok: boolean; error?: string; restaurant?: Restaurant }> {
    const restaurant = await this.findOne(restaurantId, options);

    if (!restaurant) {
      return { ok: false, error: "Restaurant not found." };
    }

    if (restaurant.ownerId !== owner.id) {
      return { ok: false, error: "You are not allowed to do this." };
    }

    return { ok: true, restaurant };
  }
}
