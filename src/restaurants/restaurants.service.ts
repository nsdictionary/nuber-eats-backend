import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Raw, Repository } from "typeorm";
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
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { Dish } from "./entities/dish.entity";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { RestaurantRepository } from "./repositories/restaurant.repository";

@Injectable()
export class RestaurantsService {
  // this.restaurants is Repository of restaurant entitiy
  constructor(
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly restaurants: RestaurantRepository,
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
      const {
        ok,
        error,
        restaurant,
      } = await this.restaurants.findAndValidateOwner(owner, data.restaurantId);

      if (!ok) {
        return { ok, error };
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
      const {
        ok,
        error,
        restaurant,
      } = await this.restaurants.findAndValidateOwner(owner, restaurantId);

      if (!ok) {
        return { ok, error };
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

  async countRestaurants(category: Category): Promise<number> {
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

      const {
        restaurants,
        totalPages,
      } = await this.restaurants.findAndPaginate(page, offset, {
        where: { category },
      });

      return {
        ok: true,
        category,
        restaurants,
        totalPages,
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
      const {
        restaurants,
        totalPages,
        totalResults,
      } = await this.restaurants.findAndPaginate(page, offset);

      return {
        ok: true,
        results: restaurants,
        totalPages,
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
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ["menu"],
      });
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
      const {
        restaurants,
        totalPages,
        totalResults,
      } = await this.restaurants.findAndPaginate(page, offset, {
        where: {
          name: Raw((name) => `${name} ILike '%${query}%'`),
        },
      });

      return {
        ok: true,
        results: restaurants,
        totalPages,
        totalResults,
      };
    } catch (error) {
      return { ok: false, error: "Could not search for restaurants" };
    }
  }

  async createDish(
    owner: User,
    data: CreateDishInput
  ): Promise<CreateDishOutput> {
    try {
      const {
        ok,
        error,
        restaurant,
      } = await this.restaurants.findAndValidateOwner(owner, data.restaurantId);

      if (!ok) {
        return { ok, error };
      }

      await this.dishes.save(this.dishes.create({ ...data, restaurant }));

      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not create restaurants" };
    }
  }

  private async checkDishOwner(
    ownerId: number,
    dishId: number
  ): Promise<{ ok: boolean; error?: string }> {
    const dish: Dish = await this.dishes.findOne(dishId, {
      relations: ["restaurant"],
    });

    if (!dish) {
      return { ok: false, error: "Dish not found" };
    }

    if (ownerId !== dish.restaurant.ownerId) {
      return { ok: false, error: "You can't do that." };
    }

    return { ok: true };
  }

  async editDish(owner: User, data: EditDishInput): Promise<EditDishOutput> {
    try {
      const chkDishResult = await this.checkDishOwner(owner.id, data.dishId);
      if (!chkDishResult.ok) {
        return chkDishResult;
      }

      await this.dishes.save([
        {
          id: data.dishId,
          ...data,
        },
      ]);

      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: "Could not edit dish" };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput
  ): Promise<DeleteDishOutput> {
    try {
      const chkDishResult = await this.checkDishOwner(owner.id, dishId);
      if (!chkDishResult.ok) {
        return chkDishResult;
      }

      await this.dishes.delete(dishId);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not delete dish" };
    }
  }
}
