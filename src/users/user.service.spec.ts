import { Test } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User, UserRole } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { JwtService } from "../jwt/jwt.service";
import { MailService } from "../mail/mail.service";
import { Repository } from "typeorm";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => "signed-token-baby"),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UserService", () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createAccount", () => {
    const createAccountArgs: CreateAccountInput = {
      email: "bs@email.com",
      password: "bs.password",
      role: UserRole.Client,
    };

    const createVerificationArgs = {
      user: createAccountArgs,
      code: "code",
    };

    it("should fail if user exist", async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: "test@test.com",
      });

      const result: CreateAccountOutput = await service.createAccount(
        createAccountArgs
      );

      expect(result).toMatchObject({
        ok: false,
        error: "There is a user with that email already",
      });
    });

    it("should create a new user", async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue(createVerificationArgs);
      verificationsRepository.save.mockResolvedValue(createVerificationArgs);

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        createVerificationArgs
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
      expect(result).toEqual({ ok: true });
    });

    it("should fail on exception", async () => {
      const error = new Error();
      usersRepository.findOne.mockRejectedValue(error);
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe("login", () => {
    const loginArgs = {
      email: "bs@email.com",
      password: "bs.password",
    };

    it("should fail if user does not exist", async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(result).toEqual({
        ok: false,
        error: "User not found",
      });
    });

    it("should fail if the password wrong", async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Wrong password" });
    });

    it("should return token if password correct", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: "signed-token-baby" });
    });

    it("should fail on exception", async () => {
      const error = new Error();
      usersRepository.findOne.mockRejectedValue(error);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe("findById", () => {
    const findByIdArgs = { id: 1 };

    it("should find an existing user", async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it("should fail if no user is found", async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: "User not found." });
    });
  });

  describe("editProfile", () => {
    it("should change email", async () => {
      const oldUser = {
        email: "bs@old.com",
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        data: { email: "bs@new.com" },
      };
      const newVerification = {
        code: "code",
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.data.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.data);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        id: editProfileArgs.userId,
      });

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code
      );
    });

    it("should change password", async () => {
      const editProfileArgs = {
        userId: 1,
        data: { password: "new.password" },
      };
      usersRepository.findOne.mockResolvedValue({ password: "old" });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.data
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.data);
      expect(result).toEqual({ ok: true });
    });

    it("should fail on exception", async () => {
      const error = new Error();
      usersRepository.findOne.mockRejectedValue(error);
      const result = await service.editProfile(1, { email: "12" });
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe("deleteUser", () => {
    const deleteArgs = { id: 1 };

    it("should fail if not exist affected row", async () => {
      usersRepository.delete.mockResolvedValue({ affected: 0 });
      const result = await service.deleteUser(deleteArgs.id);
      expect(usersRepository.delete).toHaveBeenCalledTimes(1);
      expect(usersRepository.delete).toHaveBeenCalledWith({
        id: deleteArgs.id,
      });
      expect(result).toEqual({ ok: false, error: "Delete failed" });
    });

    it("should delete user", async () => {
      usersRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.deleteUser(deleteArgs.id);
      expect(usersRepository.delete).toHaveBeenCalledTimes(1);
      expect(usersRepository.delete).toHaveBeenCalledWith({
        id: deleteArgs.id,
      });
      expect(result).toEqual({ ok: true, error: null });
    });

    it("should fail on exception", async () => {
      const error = new Error();
      usersRepository.delete.mockRejectedValue(error);
      const result = await service.deleteUser(deleteArgs.id);
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe("verifyEmail", () => {
    it("should verify email", async () => {
      const mockedVerification = {
        id: 1,
        user: {
          verified: false,
        },
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail("");

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith({
        id: mockedVerification.id,
      });
      expect(result).toEqual({ ok: true });
    });

    it("should fail on verification not found", async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail("");
      expect(result).toEqual({ ok: false, error: "Verification not found." });
    });

    it("should fail on exception", async () => {
      const error = new Error();
      verificationsRepository.findOne.mockRejectedValue(error);
      const result = await service.verifyEmail("");
      expect(result).toEqual({ ok: false, error });
    });
  });
});
