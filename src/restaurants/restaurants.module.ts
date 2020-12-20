import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  CategoryResolver,
  DishResolver,
  RestaurantsResolver,
} from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";
import { CategoryRepository } from "./repositories/category.repository";
import { Dish } from "./entities/dish.entity";
import { RestaurantRepository } from "./repositories/restaurant.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantRepository, Dish, CategoryRepository]),
  ], // import repository
  providers: [
    RestaurantsResolver,
    CategoryResolver,
    DishResolver,
    RestaurantService,
  ],
})
export class RestaurantsModule {}
