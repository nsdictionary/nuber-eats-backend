import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entitiy";
import { RestaurantsResolver } from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";
import { CategoryRepository } from "./repositories/category.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])], // import repository
  providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
