import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindUsersUseCase } from "../../../src/User/UseCases/FindUsersUseCase/FindUsersUseCase";
import { MockUserRepository } from "../MockUserRepository";
import { User, UserId } from "../../../src/User";
import { DUMMY_USER_ID } from "../MockUser";
import { userDtoMapper } from "../../../src/User/Dtos/UserDto";
import { Username } from "../../../src/User/Domain/ValueObject/Username";

describe("find users use case", () => {
	let mockUserRepository: MockUserRepository;
	let findUsersUseCase: FindUsersUseCase;
	const userId = UserId.create(DUMMY_USER_ID).value;
	const username = Username.create("name").value;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		findUsersUseCase = new FindUsersUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("find users", async () => {
		const user = User.create(userId, { username });
		mockUserRepository.pushDummyData(user);

		const result = await findUsersUseCase.execute([DUMMY_USER_ID]);
		expect(result.ok).toBeTruthy();
		expect(result.value).toEqual([userDtoMapper(user)]);
	});

	it("if some users are not found, return only finding users", async () => {
		const user = User.create(userId, { username });
		mockUserRepository.pushDummyData(user);

		const result = await findUsersUseCase.execute([
			DUMMY_USER_ID,
			"87654321-4321-4321-4321-210987654321",
		]);
		expect(result.ok).toBeTruthy();
		expect(result.value).toHaveLength(1);
		expect(result.value).toEqual([userDtoMapper(user)]);
	});

	it("user not fond, return empty array", async () => {
		const result = await findUsersUseCase.execute([DUMMY_USER_ID]);
		expect(result.ok).toBeTruthy();
		expect(result.value).toHaveLength(0);
	});
});
