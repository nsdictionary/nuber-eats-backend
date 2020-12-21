import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";
import { OrderItem } from "./entities/order-item.entitiy";
import { Dish } from "../restaurants/entities/dish.entity";
import { OrderRepository } from "./repositories/order.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderRepository,
      RestaurantRepository,
      OrderItem,
      Dish,
    ]),
  ],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
