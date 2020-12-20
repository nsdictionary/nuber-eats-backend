import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entitiy";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";
import { OrderItem } from "./entities/order-item.entitiy";
import { Dish } from "../restaurants/entities/dish.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, RestaurantRepository, OrderItem, Dish]),
  ],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
