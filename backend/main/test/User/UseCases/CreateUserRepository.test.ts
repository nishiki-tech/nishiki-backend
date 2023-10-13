import {afterEach, beforeEach, describe, expect, it, test, vi} from "vitest";
import {CreateUserUseCase} from "../../../src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import {MockUserRepository} from "../MockUserRepository";
import {IUserRepository} from "../../../src/User/Domain/IUserRepository";

describe("create user repository", () => {
	let mockUserRepository: IUserRepository;
	let createUserUseCase: CreateUserUseCase;

	beforeEach(() => {
		mockUserRepository = new MockUserRepository()
		createUserUseCase = new CreateUserUseCase(mockUserRepository);
	})

	afterEach(() => {
		vi.clearAllMocks();
	})

	it("create user", async () => {
		vi.spyOn(mockUserRepository, "create");

		const result = await createUserUseCase.execute({ id: "userId", name: "userName" });

		expect(result.ok).toBeTruthy();

		expect(mockUserRepository.create).toBeCalledTimes(1);

		if (result.ok) {
			expect(result.value.id).toBe("userId");
			expect(result.value.name).toBe("userName");
		}

	})
})