import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "../payment/entities/payment.entity";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from "./dtos/create-payment.dto";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    private readonly restaurants: RestaurantRepository
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput
  ): Promise<CreatePaymentOutput> {
    try {
      const {
        ok,
        error,
        restaurant,
      } = await this.restaurants.findAndValidateOwner(owner, restaurantId);

      if (!ok) {
        return { ok, error };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        })
      );

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not create payment." };
    }
  }
}
