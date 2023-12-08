import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindContainerUseCase } from "src/Group/UseCases/FindContainerUseCase/FindContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { containerDtoMapper } from "src/Group/Dtos/ContainerDto";

describe("find container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let useCase: FindContainerUseCase;

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		useCase = new FindContainerUseCase(mockContainerRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("Find exiting container", async () => {
		const containerId = ContainerId.create("dummyId").unwrap();
		const container: Container = Container.default(containerId).unwrap();

		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);

		const result = await useCase.execute({ containerId: containerId.id });
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual(containerDtoMapper(container));
	});

	it("Container not found", async () => {
		const result = await useCase.execute({ containerId: "dummyId" });
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toBeNull();
	});
});
