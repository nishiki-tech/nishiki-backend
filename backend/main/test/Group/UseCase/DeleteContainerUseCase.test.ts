import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteContainerUseCase } from "src/Group/UseCases/DeleteContainerUseCase/DeleteContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";

describe("delete container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let useCase: DeleteContainerUseCase;

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		useCase = new DeleteContainerUseCase(mockContainerRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("delete container", async () => {
		const containerId = ContainerId.create("dummyId").unwrap();
		const container: Container = Container.default(containerId).unwrap();
		// add the mock container into the mock repo.
		mockContainerRepository.pushDummyData(container);

		const result = await useCase.execute({ containerId: "dummyId" });
		expect(result.ok).toBeTruthy();
	});
});
