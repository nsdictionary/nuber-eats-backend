import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entitiy";
import { Category } from "./entities/category.entity";
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from "./dtos/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService {
  // this.restaurants is Repository of restaurant entitiy
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository
  ) {}

  async createRestaurant(
    owner: User,
    data: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(data);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(data.categoryName);
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not create restaurant" };
    }
  }

  async editRestaurant(
    owner: User,
    data: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(data.restaurantId);

      if (!restaurant) {
        return { ok: false, error: "Restaurant not found" };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      let category: Category = null;
      if (data.categoryName) {
        category = await this.categories.getOrCreate(data.categoryName);
      }

      await this.restaurants.save([
        {
          id: data.restaurantId,
          ...data,
          ...(category && { category }),
        },
      ]);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not edit Restaurant" };
    }
  }
}
