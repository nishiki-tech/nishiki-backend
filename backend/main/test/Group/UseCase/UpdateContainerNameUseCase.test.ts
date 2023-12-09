import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { ContainerIsNotExisting } from "src/Group/UseCases/UpdateContainerNameUseCase/IUpdateContainerNameUseCase";

describe("find container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let useCase: UpdateContainerNameUseCase;

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		useCase = new UpdateContainerNameUseCase(mockContainerRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("change exiting container'name", async () => {
		const containerId = ContainerId.create("dummyId").unwrap();
		const container: Container = Container.default(containerId).unwrap();

		// TODO: add the mock container into the mock repo instead of using spy.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);

		const result = await useCase.execute({
			containerId: containerId.id,
			name: "new name",
		});
		console.log(result);
		expect(result.ok).toBeTruthy();
	});

	it("Container not found", async () => {
		const result = await useCase.execute({
			containerId: "dummy Id",
			name: "new name",
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});
});
