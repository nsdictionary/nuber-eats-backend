import { Resolver } from "@nestjs/graphql";
import { Payment } from "../payment/entities/payment.entity";
import { PaymentsService } from "./payments.service";

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}
}
