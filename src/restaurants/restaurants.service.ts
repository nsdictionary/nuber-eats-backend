import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Repository } from "typeorm";
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entitiy";

@Injectable()
export class RestaurantService {
  // this.restaurants is Repository of restaurant entitiy
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>
  ) {}

  async createRestaurant(
    owner: User,
    data: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(data);
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
