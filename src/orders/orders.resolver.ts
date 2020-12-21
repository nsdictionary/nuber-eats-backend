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
import { PUB_SUB } from "../common/common.constants";
import { Inject } from "@nestjs/common";

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

  @Mutation(() => Boolean)
  async potatoReady(@Args("potatoId") potatioId: number) {
    await this.pubSub.publish("hotPotatos", {
      readyPotato: potatioId,
    });
    return true;
  }

  @Subscription(() => String, {
    filter: ({ readyPotato }, { potatoId }) => {
      return readyPotato == potatoId;
    },
    resolve: ({ readyPotato }) =>
      `Your potato with the id ${readyPotato} is ready!`,
  })
  @Role(["Any"])
  readyPotato(@Args("potatoId") potatoId: number) {
    return this.pubSub.asyncIterator("hotPotatos");
  }
}
