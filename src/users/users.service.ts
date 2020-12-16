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
import { Verification } from "./entities/verification.entitiy";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
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

      const user: User = await this.users.save(
        this.users.create({ email, password, role })
      );

      await this.verifications.save(this.verifications.create({ user }));

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
      const user = await this.users.findOne(
        { email },
        { select: ["id", "password"] }
      );
      if (!user) {
        return { ok: false, error: "User not found" };
      }

      console.log(user);
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
      if (k === "email") {
        user.verified = false;
        await this.verifications.save(this.verifications.create({ user }));
      }
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

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        {
          // loadRelationIds: true, // include only user id
          relations: ["user"], // include user object
        }
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete({ id: verification.id });

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
