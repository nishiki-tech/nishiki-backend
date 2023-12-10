import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateUserNameUseCase } from "src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";
import { MockUserRepository } from "../MockUserRepository";
import {
	IncorrectUsersRequest,
	UserIsNotExisting,
} from "src/User/UseCases/UpdateUserUseCase/IUpdateUserNameUseCase";
import { User, UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";

const USER_ID = UserId.generate().id;

describe("update user name use case", () => {
	let mockUserRepository: MockUserRepository;
	let updateUserNameUseCase: UpdateUserNameUseCase;

	// mock user id
	const userId = UserId.create(USER_ID).unwrap();

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		updateUserNameUseCase = new UpdateUserNameUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("update user name", async () => {
		const UPDATED_NAME = "eman";
		const username = Username.create("name").unwrap();
		const emailAddress = EmailAddress.create("bar@nishiki.com").unwrap();

		const user: User = User.create(userId, { username, emailAddress });

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
		expect(nameUpdatedUser!.name.name).toBe(UPDATED_NAME);
	});

	it("user doesn't have enough role", async () => {
		const result = await updateUserNameUseCase.execute({
			userId: USER_ID,
			targetUserId: UserId.generate().id,
			name: "",
		});

		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).toBeInstanceOf(IncorrectUsersRequest);
	});

	it("user not found", async () => {
		// @ts-ignore, this method is overrode.
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(null);

		const result = await updateUserNameUseCase.execute({
			userId: USER_ID,
			targetUserId: USER_ID,
			name: "name",
		});

		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).toBeInstanceOf(UserIsNotExisting);
	});
});
