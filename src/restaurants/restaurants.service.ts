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

@Injectable()
export class RestaurantService {
  // this.restaurants is Repository of restaurant entitiy
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>
  ) {}

  async createRestaurant(
    owner: User,
    data: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(data);
      newRestaurant.owner = owner;
      const categoryName = data.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, "-");
      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName })
        );
      }
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
