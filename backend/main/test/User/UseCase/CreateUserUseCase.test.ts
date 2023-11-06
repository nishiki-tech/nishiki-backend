import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IUserRepository } from "../../../src/User/Domain/IUserRepository";
import { CreateUserUseCase } from "../../../src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { MockUserRepository } from "../MockUserRepository";
import { User, UserId } from "../../../src/User";
import { Username } from "../../../src/User/Domain/ValueObject/Username";
import { EmailAddress } from "../../../src/User/Domain/ValueObject/EmailAddress";

describe("create user use case", () => {
	let mockUserRepository: IUserRepository;
	let useCase: CreateUserUseCase;

	const userId = UserId.generate();
	const username = Username.create("name").value;
	const emailAddress = EmailAddress.create("bar@nishiki.com");
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
			Promise.resolve(undefined),
		);

		const result = await useCase.execute({
			id: userId.id,
			name: "name",
			emailAddress: "bar@nishiki.com",
		});

		expect(result.ok).toBeTruthy();
	});

	it("target user is already existing", async () => {
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(
			Promise.resolve(user),
		);

		const result = await useCase.execute({
			id: userId.id,
			name: "name",
		});

		expect(result.ok).toBeFalsy();
	});
});
