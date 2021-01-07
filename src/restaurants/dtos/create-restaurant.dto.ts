import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entitiy";
import { CoreOutput } from "../../common/dtos/output.dto";

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  "name",
  "coverImg",
  "address",
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(() => Int)
  restaurantId?: number;
}
