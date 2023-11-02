import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IUserRepository } from "../../../src/User/Domain/IUserRepository";
import { CreateUserUseCase } from "../../../src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { MockUserRepository } from "../MockUserRepository";
import { User, UserId } from "../../../src/User";
import { DUMMY_USER_ID } from "../MockUser";
import { Username } from "../../../src/User/Domain/ValueObject/Username";
import { UserAlreadyExistingError } from "../../../src/User/UseCases/CreateUserUseCase/ICreateUserUseCase";

describe("create user use case", () => {
	let mockUserRepository: IUserRepository;
	let useCase: CreateUserUseCase;

	const userId = UserId.create(DUMMY_USER_ID).value!;
	const userName = Username.create("name").value;
	const user = User.create(userId, { name: userName });

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		useCase = new CreateUserUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("create user", async () => {
		// when the user is not registered yet.
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(undefined);

		const result = await useCase.execute({
			id: DUMMY_USER_ID,
			name: "name",
		});

		expect(result.ok).toBeTruthy();
	});

	it("target user is already existing", async () => {
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(user);

		const result = await useCase.execute({
			id: DUMMY_USER_ID,
			name: "name",
		});

		expect(result.ok).toBeFalsy();
	});
});
