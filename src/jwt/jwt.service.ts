import { Inject, Injectable } from "@nestjs/common";
import { JwtModuleOptions } from "./jwt.interfaces";
import { CONFIG_OPTIONS } from "./jwt.constant";

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS)
    private readonly options: JwtModuleOptions
  ) {}
  hello() {
    console.log("Hello!");
  }
}
