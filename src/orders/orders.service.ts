import { Injectable } from "@nestjs/common";
import { Order } from "./entities/order.entitiy";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import {
  CreateOrderInput,
  CreateOrderItemInput,
  CreateOrderOutput,
} from "./dtos/create-order.dto";
import { User } from "../users/entities/user.entity";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";
import { OrderItem } from "./entities/order-item.entitiy";
import { Dish } from "../restaurants/entities/dish.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return { ok: false, error: "Dish not found." };
        }
        console.log(`Dish price: ${dish.price}`);

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name
          );
          if (dishOption) {
            if (dishOption.extra) {
              console.log(`$USD + ${dishOption.extra}`);
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  console.log(`$USD + ${dishOptionChoice.extra}`);
                }
              }
            }
          }
        }
        /*await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        ); */
      }
      /* const order = await this.orders.save(
       this.orders.create({
         customer,
         restaurant,
       }),
     );
     console.log(order); */

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not create order" };
    }
  }
}
