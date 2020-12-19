import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { Category } from "./category.entity";
import { User } from "../../users/entities/user.entity";
import { Dish } from "./dish.entity";

@InputType("RestaurantInputType", { isAbstract: true }) // it's for only dto
@ObjectType() // for build graphql schema
@Entity() // for TypeORM (sync database)
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: "SET NULL",
  })
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: "CASCADE" })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[];
}
