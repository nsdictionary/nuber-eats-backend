import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "../payment/entities/payment.entity";
import { LessThan, Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from "./dtos/create-payment.dto";
import { RestaurantRepository } from "../restaurants/repositories/restaurant.repository";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";
import { Interval } from "@nestjs/schedule";

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
        this.payments.create({ transactionId, user: owner, restaurant })
      );

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      await this.restaurants.save(restaurant);

      return { ok: true };
    } catch {
      return { ok: false, error: "Could not create payment." };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user });
      return { ok: true, payments };
    } catch {
      return { ok: false, error: "Could not load payments." };
    }
  }

  // @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    console.log(restaurants);

    for (const restaurant of restaurants) {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    }
  }
}
