import { EntityRepository, FindManyOptions, Repository } from "typeorm";
import { Restaurant } from "../entities/restaurant.entitiy";

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
      ...options,
    });

    return {
      restaurants,
      totalResults,
      totalPages: Math.ceil(totalResults / offset),
    };
  }
}
