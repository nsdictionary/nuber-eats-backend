import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { User } from "../../users/entities/user.entity";
import { Restaurant } from "../../restaurants/entities/restaurant.entitiy";
import { Dish } from "../../restaurants/entities/dish.entity";

export enum OrderStatus {
  Pending = "Pending",
  Cooking = "Cooking",
  Pickup = "Pickup",
  Delivered = "Delivered",
}

registerEnumType(OrderStatus, { name: "OrderStatus" });

@InputType("OrderInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: "SET NULL",
    nullable: true,
  })
  customer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: "SET NULL",
    nullable: true,
  })
  driver?: User;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: "SET NULL",
    nullable: true,
  })
  restaurant: Restaurant;

  @Field(() => [Dish])
  @ManyToMany(() => Dish)
  @JoinTable()
  dishes: Dish[];

  @Field(() => Float)
  @Column()
  total: number;

  @Field(() => OrderStatus)
  @Column({ type: "enum", enum: OrderStatus })
  status: OrderStatus;
}
