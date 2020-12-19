import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entitiy";
import {
  CategoryResolver,
  DishResolver,
  RestaurantsResolver,
} from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";
import { CategoryRepository } from "./repositories/category.repository";
import { Dish } from "./entities/dish.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository])], // import repository
  providers: [
    RestaurantsResolver,
    CategoryResolver,
    DishResolver,
    RestaurantService,
  ],
})
export class RestaurantsModule {}
