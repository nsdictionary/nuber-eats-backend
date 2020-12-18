import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entitiy";
import { RestaurantsResolver } from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";
import { Category } from "./entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])], // import repository
  providers: [RestaurantsResolver, RestaurantService],
})
export class RestaurantsModule {}
