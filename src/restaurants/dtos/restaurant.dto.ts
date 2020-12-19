import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "../../common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entitiy";

@InputType()
export class RestaurantInput {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  results?: Restaurant;
}
