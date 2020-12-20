import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entitiy";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Order, RestaurantRepository])],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
