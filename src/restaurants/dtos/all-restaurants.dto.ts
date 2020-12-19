import { Field, InputType, ObjectType } from "@nestjs/graphql";
import {
  PaginationInput,
  PaginationOutput,
} from "../../common/dtos/pagination.dto";
import { Restaurant } from "../entities/restaurant.entitiy";

@InputType()
export class AllRestaurantsInput extends PaginationInput {}

@ObjectType()
export class AllRestaurantsOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[];
}
