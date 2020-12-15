import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true }) // it's for only dto
@ObjectType() // for build graphql schema
@Entity() // for TypeORM (sync database)
export class Restaurant {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Boolean, { nullable: true }) // grqphql
  @Column({ default: true }) // TypeORM
  @IsBoolean() // dto(class validator)
  @IsOptional()
  isVegan: boolean;

  @Field(() => String, { defaultValue: 'SEOUL' })
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field(() => String)
  @Column()
  @IsString()
  categoryName: string;
}
