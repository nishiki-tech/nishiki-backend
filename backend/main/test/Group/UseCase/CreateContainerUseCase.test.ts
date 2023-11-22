import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";

describe("create container use case", () => {
	let mockContainerRepository: IContainerRepository;
	let useCase: CreateContainerUseCase;

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

		const result = await useCase.execute({});

		expect(result.ok).toBeTruthy();
	});
	it("create container with name", async () => {
		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			name: "name",
		});
		expect(result.ok).toBeTruthy();
	});
});
