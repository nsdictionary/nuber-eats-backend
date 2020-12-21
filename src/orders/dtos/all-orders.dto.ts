import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Order, OrderStatus } from "../entities/order.entitiy";
import { CoreOutput } from "../../common/dtos/output.dto";

@InputType()
export class AllOrdersInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class AllOrdersOutput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
