import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entitiy";
import { JwtService } from "../jwt/jwt.service";
import { UserProfileInput } from "./dtos/user-profile.dto";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { tryCatch } from "rxjs/internal-compatibility";
import { CoreOutput } from "../common/dtos/output.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  getAll(): Promise<User[]> {
    return this.users.find();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: "There is a user with that email already" };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: "User not found" };
      }

      if (!(await user.checkPassword(password))) {
        return { ok: false, error: "Wrong password" };
      }

      return {
        ok: true,
        token: this.jwtService.sign(user.id),
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(id: number, data: EditProfileInput): Promise<User> {
    const user = await this.users.findOne({ id });
    for (const k in data) {
      user[k] = data[k];
    }
    return this.users.save(user);
  }

  async deleteUser(id: number): Promise<CoreOutput> {
    try {
      const result: DeleteResult = await this.users.delete({ id });
      return {
        ok: result.affected > 0,
        error: result.affected == 0 ? "Delete failed" : null,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
