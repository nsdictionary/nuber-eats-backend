import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { User } from "./user.entitiy";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Field(() => String)
  @Column()
  code: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
