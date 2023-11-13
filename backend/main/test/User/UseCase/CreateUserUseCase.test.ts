import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { MockUserRepository } from "../MockUserRepository";
import { User, UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";

describe("create user use case", () => {
	let mockUserRepository: IUserRepository;
	let useCase: CreateUserUseCase;

	const userId = UserId.generate();
	const username = Username.create("name").unwrap();
	const emailAddress = EmailAddress.create("bar@nishiki.com").unwrap();
	const user = User.create(userId, { username, emailAddress });

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		useCase = new CreateUserUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("create user", async () => {
		// when the user is not registered yet.
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			name: "name",
			emailAddress: "bar@nishiki.com",
		});

		expect(result.ok).toBeTruthy();
	});
});
