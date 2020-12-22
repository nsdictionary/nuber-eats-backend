import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Payment } from "../payment/entities/payment.entity";
import { PaymentsService } from "./payments.service";
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from "./dtos/create-payment.dto";
import { Role } from "../auth/role.decorator";
import { AuthUser } from "../auth/auth-user.decorator";
import { User } from "../users/entities/user.entity";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => CreatePaymentOutput)
  @Role(["Owner"])
  createPayment(
    @AuthUser() owner: User,
    @Args("data") data: CreatePaymentInput
  ): Promise<CreatePaymentOutput> {
    return this.paymentsService.createPayment(owner, data);
  }

  @Query(() => GetPaymentsOutput)
  @Role(["Owner"])
  getPayments(@AuthUser() user: User): Promise<GetPaymentsOutput> {
    return this.paymentsService.getPayments(user);
  }
}
