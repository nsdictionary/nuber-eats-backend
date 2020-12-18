import { InputType, ObjectType, OmitType, PickType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entitiy";
import { CoreOutput } from "../../common/dtos/output.dto";

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  "name",
  "coverImg",
  "address",
]) {}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
