import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entitiy';

@Injectable()
export class RestaurantService {
  // this.restaurants is Repository of restaurant entitiy
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  createRestaurant(dto: CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(dto);
    return this.restaurants.save(newRestaurant);
  }
}
