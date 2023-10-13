import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {IUserRepository} from "../../../src/User/Domain/IUserRepository";
import {UpdateUserNameUseCase} from "../../../src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";
import {MockUserRepository} from "../MockUserRepository";
import {MockUserId, MockUser} from "../MockUser"
import {
	NotHaveAppropriateRole,
	UserIsNotExisting
} from "../../../src/User/UseCases/UpdateUserUseCase/IUpdateUserNameUseCase";

describe("update user name use case", () => {
	let mockUserRepository: IUserRepository;
	let updateUserNameUseCase: UpdateUserNameUseCase;

	// mock user id
	const userId = MockUserId.createMock("id");

	beforeEach(() => {
		mockUserRepository = new MockUserRepository();
		updateUserNameUseCase = new UpdateUserNameUseCase(mockUserRepository);
	})

	afterEach(() => {
		vi.clearAllMocks();
	})

	it("update user name", async () => {
		// this user has an admin role.
		const user = MockUser.crateMock(userId, "name", true);

		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(Promise.resolve(user));
		vi.spyOn(mockUserRepository, "update");

		const result = await updateUserNameUseCase.execute({ id: "id", name: "test"})

		expect(result.ok).toBeTruthy();
		expect(mockUserRepository.find).toBeCalledTimes(1);
		expect(mockUserRepository.update).toBeCalledTimes(1);
	})

	it("user doesn't have enough role", async () => {
		// not
		const user = MockUser.crateMock(userId, "name", false);

		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(Promise.resolve(user));
		vi.spyOn(mockUserRepository, "update");

		const result = await updateUserNameUseCase.execute({ id: "id", name: "test" });

		expect(result.ok).toBeFalsy();
		expect(mockUserRepository.find).toBeCalledTimes(1);
		expect(mockUserRepository.update).toBeCalledTimes(0);

		expect(result.error).toBeInstanceOf(NotHaveAppropriateRole)

	})

	it("user not found", async () => {
		vi.spyOn(mockUserRepository, "find").mockReturnValueOnce(undefined);

		const result = await updateUserNameUseCase.execute({ id: "id", name: "name" });

		expect(result.ok).toBeFalsy();
		expect(result.error).toBeInstanceOf(UserIsNotExisting)

	})

})