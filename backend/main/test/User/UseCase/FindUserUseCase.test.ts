import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockUserRepository } from "../MockUserRepository";
import { FindUserUseCase } from "../../../src/User/UseCases/FindUserUseCase/FindUserUseCase";
import { DUMMY_USER_ID } from "../MockUser";
import { IUserRepository } from "../../../src/User/Domain/IUserRepository";
import { User, UserId } from "../../../src/User";
import { userDtoMapper } from "../../../src/User/Dtos/UserDto";
import { Username } from "../../../src/User/Domain/ValueObject/Username";

describe("find user use case", () => {
	let mockUserRepository: IUserRepository;
	let findUserUseCase: FindUserUseCase;
	const username = Username.create("name");

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		findUserUseCase = new FindUserUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("find user", async () => {
		const userId = UserId.create(DUMMY_USER_ID).value;
		const user = User.create(userId, { username });

		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(
			Promise.resolve(user),
		);

		const result = await findUserUseCase.execute(DUMMY_USER_ID);

		expect(result.ok).toBeTruthy();
		expect(result.value).toEqual(userDtoMapper(user));
	});

	it("user not found", async () => {
		const user = await findUserUseCase.execute(DUMMY_USER_ID);
		expect(user.ok).toBeTruthy();
		expect(user.value).toBeUndefined();
	});
});
