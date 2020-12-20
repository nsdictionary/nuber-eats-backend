import { Injectable } from "@nestjs/common";
import { Order } from "./entities/order.entitiy";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { User } from "../users/entities/user.entity";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    private readonly restaurants: RestaurantRepository
  ) {}

  async crateOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: "Restaurant not found" };
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
        })
      );
      console.log(order);

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not create order" };
    }
  }
}
