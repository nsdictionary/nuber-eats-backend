import { InputType, PickType } from "@nestjs/graphql";
import { Order } from "../entities/order.entitiy";

@InputType()
export class OrderUpdatesInput extends PickType(Order, ["id"]) {}
