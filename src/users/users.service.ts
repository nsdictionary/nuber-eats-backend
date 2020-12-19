import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "../jwt/jwt.service";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { CoreOutput } from "../common/dtos/output.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: "There is a user with that email already" };
      }

      const user: User = await this.users.save(
        this.users.create({ email, password, role })
      );

      const verification = await this.verifications.save(
        this.verifications.create({ user })
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);

      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ["id", "password"] }
      );
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

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: "User not found." };
    }
  }

  async editProfile(
    id: number,
    data: EditProfileInput
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      for (const k in data) {
        if (k === "email") {
          user.verified = false;
          await this.verifications.delete({ user: { id: user.id } });
          const verification = await this.verifications.save(
            this.verifications.create({ user })
          );
          this.mailService.sendVerificationEmail(data[k], verification.code);
        }
        user[k] = data[k];
      }

      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
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

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
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

        return { ok: true };
      } else {
        return { ok: false, error: "Verification not found." };
      }
    } catch (error) {
      return { ok: false, error };
    }
  }
}
