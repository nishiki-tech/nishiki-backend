import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { GroupId } from "src/Group/Domain/Entities/Group";

describe("create container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let useCase: CreateContainerUseCase;
	const groupId = GroupId.create("dummyGroupId").unwrap();

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		useCase = new CreateContainerUseCase(mockContainerRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("create container", async () => {
		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({ groupId: groupId.id });
		expect(result.ok).toBeTruthy();
	});
	it("create container with name", async () => {
		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			groupId: groupId.id,
			name: "dummy-name",
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap().name).toBe("dummy-name");
	});
});
