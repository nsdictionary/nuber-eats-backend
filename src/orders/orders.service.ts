import { Injectable } from "@nestjs/common";
import { Order } from "./entities/order.entitiy";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>
  ) {}
}
