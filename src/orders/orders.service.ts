import { Inject, Injectable } from "@nestjs/common";
import { Order, OrderStatus } from "./entities/order.entitiy";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { User, UserRole } from "../users/entities/user.entity";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";
import { OrderItem } from "./entities/order-item.entitiy";
import { Dish } from "../restaurants/entities/dish.entity";
import { AllOrdersInput, AllOrdersOutput } from "./dtos/all-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { OrderRepository } from "./repositories/order.repository";
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from "../common/common.constants";
import { PubSub } from "graphql-subscriptions";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly restaurants: RestaurantRepository,
    private readonly orders: OrderRepository,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
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

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return { ok: false, error: "Dish not found." };
        }

        let dishFinalPrice = dish.price;

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name
          );

          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }

        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          })
        );
        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        })
      );

      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not create order." };
    }
  }

  async getOrders(
    user: User,
    { status }: AllOrdersInput
  ): Promise<AllOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: { customer: user, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: user, ...(status && { status }) },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: { owner: user },
          relations: ["orders"],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);

        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return { ok: true, orders };
    } catch {
      return { ok: false, error: "Could not get orders" };
    }
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput
  ): Promise<GetOrderOutput> {
    try {
      const { ok, error, order } = await this.orders.getOrderAndValidate(
        user,
        orderId
      );
      if (!ok) {
        return { ok, error };
      }

      return { ok: true, order };
    } catch {
      return { ok: false, error: "Could not load order." };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput
  ): Promise<EditOrderOutput> {
    try {
      const { ok, error, order } = await this.orders.getOrderAndValidate(
        user,
        orderId
      );
      if (!ok) {
        return { ok, error };
      }

      if (!this.orders.canEditOrder(user, status)) {
        return { ok: false, error: "You can't do that." };
      }

      await this.orders.save([{ id: orderId, status }]);
      const newOrder: Order = { ...order, status };

      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubSub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not edit order." };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);

      if (!order) {
        return { ok: false, error: "Order not found" };
      }

      if (order.driver) {
        return { ok: false, error: "This order already has a driver" };
      }

      await this.orders.save({ id: orderId, driver });

      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not update order." };
    }
  }
}
