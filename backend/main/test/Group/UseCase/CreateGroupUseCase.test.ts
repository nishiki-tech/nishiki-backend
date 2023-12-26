import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { MockGroupRepository } from "../MockGroupRepository";
import { UserId } from "src/User/Domain/Entity/User";

const USER_ID = UserId.generate();

describe("create group use case", () => {
	let mockGroupRepository: MockGroupRepository;
	let useCase: CreateGroupUseCase;

	beforeEach(() => {
		mockGroupRepository = new MockGroupRepository();
		useCase = new CreateGroupUseCase(mockGroupRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("create group", async () => {
		// when the group is not registered yet.
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			name: "dummy-name",
			userId: USER_ID.id,
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap().name).toBe("dummy-name");
		expect(mockGroupRepository.memoryGroups[0].userIds[0].id).toBe(USER_ID.id);
	});
	it("create group without name", async () => {
		// when the group is not registered yet.
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			userId: USER_ID.id,
		});
		expect(result.ok).toBeTruthy();
	});
});
