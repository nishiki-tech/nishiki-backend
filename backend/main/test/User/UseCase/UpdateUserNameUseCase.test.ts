import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateUserNameUseCase } from "../../../src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";
import { MockUserRepository } from "../MockUserRepository";
import {
	IncorrectUsersRequest,
	UserIsNotExisting,
} from "../../../src/User/UseCases/UpdateUserUseCase/IUpdateUserNameUseCase";
import { User, UserId } from "../../../src/User";
import { Username } from "../../../src/User/Domain/ValueObject/Username";

const USER_ID = UserId.generate().id;

describe("update user name use case", () => {
	let mockUserRepository: MockUserRepository;
	let updateUserNameUseCase: UpdateUserNameUseCase;

	// mock user id
	const userId = UserId.create(USER_ID).value;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		updateUserNameUseCase = new UpdateUserNameUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("update user name", async () => {
		const UPDATED_NAME = "eman";
		const username = Username.create("name").value;

		const user: User = User.create(userId, { username: username });

		// add the mock user into the mock repo.
		mockUserRepository.pushDummyData(user);

		const result = await updateUserNameUseCase.execute({
			userId: USER_ID,
			targetUserId: USER_ID,
			name: UPDATED_NAME,
		});

		expect(result.ok).toBeTruthy();

		// read the user from the mock repo.
		const nameUpdatedUser = await mockUserRepository.find(userId);
		expect(nameUpdatedUser.name.name).toBe(UPDATED_NAME);
	});

	it("user doesn't have enough role", async () => {
		const result = await updateUserNameUseCase.execute({
			userId: USER_ID,
			targetUserId: UserId.generate().id,
			name: "",
		});

		expect(result.ok).toBeFalsy();
		expect(result.error).toBeInstanceOf(IncorrectUsersRequest);
	});

	it("user not found", async () => {
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(undefined);

		const result = await updateUserNameUseCase.execute({
			userId: USER_ID,
			targetUserId: USER_ID,
			name: "name",
		});

		expect(result.ok).toBeFalsy();
		expect(result.error).toBeInstanceOf(UserIsNotExisting);
	});
});
