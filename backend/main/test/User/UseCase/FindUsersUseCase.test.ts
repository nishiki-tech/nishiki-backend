import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindUsersUseCase } from "src/User/UseCases/FindUsersUseCase/FindUsersUseCase";
import { MockUserRepository } from "../MockUserRepository";
import { User, UserId } from "src/User";
import { userDtoMapper } from "src/User/Dtos/UserDto";
import { Username } from "src/User/Domain/ValueObject/Username";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";

const DUMMY_USER_ID = UserId.generate().id;

describe("find users use case", () => {
	let mockUserRepository: MockUserRepository;
	let findUsersUseCase: FindUsersUseCase;
	const userId = UserId.create(DUMMY_USER_ID).unwrap();
	const username = Username.create("name").unwrap();
	const emailAddress = EmailAddress.create("bar@nihsiki.com").unwrap();

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		findUsersUseCase = new FindUsersUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("find users", async () => {
		const user = User.create(userId, { username, emailAddress });
		mockUserRepository.pushDummyData(user);

		const result = await findUsersUseCase.execute([DUMMY_USER_ID]);
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual([userDtoMapper(user)]);
	});

	it("if some users are not found, return only finding users", async () => {
		const user = User.create(userId, { username, emailAddress });
		mockUserRepository.pushDummyData(user);

		const result = await findUsersUseCase.execute([
			DUMMY_USER_ID,
			UserId.generate().id,
		]);
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toHaveLength(1);
		expect(result.unwrap()).toEqual([userDtoMapper(user)]);
	});

	it("user not fond, return empty array", async () => {
		const result = await findUsersUseCase.execute([DUMMY_USER_ID]);
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toHaveLength(0);
	});
});
