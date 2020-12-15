import { DynamicModule, Global, Module } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { JwtModuleOptions } from "./jwt.interfaces";
import { CONFIG_OPTIONS } from "./jwt.constant";

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService, // == {provide:JwtService, useClass:JwtClass}
      ],
      exports: [JwtService],
    };
  }
}
