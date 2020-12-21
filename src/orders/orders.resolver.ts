import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { Order } from "./entities/order.entitiy";
import { OrdersService } from "./orders.service";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Role } from "../auth/role.decorator";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/entities/user.entity";
import { AllOrdersInput, AllOrdersOutput } from "./dtos/all-orders.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { PubSub } from "graphql-subscriptions";
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from "../common/common.constants";
import { Inject } from "@nestjs/common";
import { OrderUpdatesInput } from "./dtos/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(["Client"])
  async createOrder(
    @AuthUser() customer: User,
    @Args("data") data: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    return this.ordersService.crateOrder(customer, data);
  }

  @Query(() => AllOrdersOutput)
  @Role(["Any"])
  async getOrders(
    @AuthUser() user: User,
    @Args("data") data: AllOrdersInput
  ): Promise<AllOrdersOutput> {
    return this.ordersService.getOrders(user, data);
  }

  @Query(() => GetOrderOutput)
  @Role(["Any"])
  async getOrder(
    @AuthUser() user: User,
    @Args("data") data: GetOrderInput
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, data);
  }

  @Mutation(() => EditOrderOutput)
  @Role(["Any"])
  async editOrder(
    @AuthUser() user: User,
    @Args("data") data: EditOrderInput
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, data);
  }

  @Subscription(() => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(["Owner"])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order)
  @Role(["Delivery"])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { data }: { data: OrderUpdatesInput },
      { user }: { user: User }
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === data.id;
    },
  })
  @Role(["Any"])
  orderUpdates(@Args("data") data: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(() => TakeOrderOutput)
  @Role(["Delivery"])
  takeOrder(
    @AuthUser() driver: User,
    @Args("data") data: TakeOrderInput
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, data);
  }
}
