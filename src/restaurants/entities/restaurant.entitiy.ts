import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { CoreEntity } from "../../common/entities/core.entity";
import { Category } from "./category.entity";

@InputType({ isAbstract: true }) // it's for only dto
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

  @Field(() => String, { defaultValue: "SEOUL" })
  @Column()
  @IsString()
  address: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.restaurants)
  category: Category;
}
