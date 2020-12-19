import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Like, Raw, Repository } from "typeorm";
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
import { promises } from "dns";

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
      const restaurant: Restaurant = await this.restaurants.findOne(
        data.restaurantId
      );

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

  async deleteRestaurant(
    owner: User,
    { restaurantId }: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant: Restaurant = await this.restaurants.findOne({
        id: restaurantId,
      });

      if (!restaurant) {
        return { ok: false, error: "Restaurant not found" };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      await this.restaurants.delete({ id: restaurantId });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not delete Restaurant" };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      // if you want involve relation add option like this
      // { relations: ["restaurants", "restaurants.owner"],
      //   where: {'restaurants.owner' : {email : 'test@test.com'} }

      return { ok: true, categories };
    } catch (error) {
      return { ok: false, error: "Could not load categories" };
    }
  }

  async countRestaurant(category: Category): Promise<number> {
    return await this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
    offset,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findCategoryBySlug(slug);

      if (!category) {
        return { ok: false, error: "Category not found" };
      }

      const restaurants = await this.restaurants.find({
        where: { category },
        take: offset,
        skip: (page - 1) * offset,
      });

      const totalResults = await this.countRestaurant(category);

      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / offset),
      };
    } catch (error) {
      return { ok: false, error: "Could not load category" };
    }
  }

  async allRestaurants({
    page,
    offset,
  }: AllRestaurantsInput): Promise<AllRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * offset,
        take: offset,
      });

      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / offset),
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: "Could not load restaurants" };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      ``;
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: "Restaurant not found" };
      }
      return { ok: true, results: restaurant };
    } catch (error) {
      return { ok: false, error: "Could not find restaurant" };
    }
  }

  async searchRestaurantByName({
    query,
    page,
    offset,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILike '%${query}%'`),
        },
        skip: (page - 1) * offset,
        take: offset,
      });

      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / offset),
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: "Could not search for restaurants" };
    }
  }
}
