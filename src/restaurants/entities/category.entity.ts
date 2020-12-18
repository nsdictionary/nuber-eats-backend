import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { IsString, Length } from "class-validator";
import { Restaurant } from "./restaurant.entitiy";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
