import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockUserRepository } from "../MockUserRepository";
import { FindUserUseCase } from "src/User/UseCases/FindUserUseCase/FindUserUseCase";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User";
import { userDtoMapper } from "src/User/Dtos/UserDto";
import { Username } from "src/User/Domain/ValueObject/Username";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";
import { v4 as uuidv4 } from "uuid";

describe("find user use case", () => {
	let mockUserRepository: IUserRepository;
	let findUserUseCase: FindUserUseCase;
	const username = Username.create("name").unwrap();
	const emailAddress = EmailAddress.create("bar@nishiki.com").unwrap();

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		findUserUseCase = new FindUserUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("find user", async () => {
		const userId = UserId.generate();
		const user = User.create(userId, { username, emailAddress });

		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(
			Promise.resolve(user),
		);

		const result = await findUserUseCase.execute(userId.id);

		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual(userDtoMapper(user));
	});

	it("user not found", async () => {
		const id = uuidv4();
		const user = await findUserUseCase.execute(id);
		expect(user.ok).toBeTruthy();
		expect(user.unwrap()).toBeNull();
	});
});
