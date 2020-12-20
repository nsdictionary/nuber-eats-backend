import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { Order } from "../entities/order.entitiy";
import { CoreOutput } from "../../common/dtos/output.dto";

@InputType()
export class CreateOrderInput extends PickType(Order, ["dishes"]) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
