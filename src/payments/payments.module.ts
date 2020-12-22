import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "../payment/entities/payment.entity";
import { PaymentsService } from "./payments.service";
import { PaymentsResolver } from "./payments.resolver";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Payment, RestaurantRepository])],
  providers: [PaymentsService, PaymentsResolver],
})
export class PaymentsModule {}
