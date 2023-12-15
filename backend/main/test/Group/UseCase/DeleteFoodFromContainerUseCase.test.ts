import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteFoodFromContainerUseCase } from "src/Group/UseCases/DeleteFoodFromContainerUseCase/DeleteFoodFromContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import {
	Container,
	ContainerDomainError,
	ContainerId,
} from "src/Group/Domain/Entities/Container";
import { ContainerIsNotExisting } from "src/Group/UseCases/DeleteFoodFromContainerUseCase/IDeleteFoodFromContainerUseCase";
import { Food, FoodId } from "src/Group/Domain/Entities/Food";

describe("delete a food from container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let useCase: DeleteFoodFromContainerUseCase;

	const containerId = ContainerId.create("dummyContainerId").unwrap();
	const foodId = FoodId.create("dummyFoodId").unwrap();

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		useCase = new DeleteFoodFromContainerUseCase(mockContainerRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("delete a food from a exiting container", async () => {
		const food = Food.create(foodId, {
			name: "dummy food name",
		}).unwrap();
		const container: Container = Container.create(containerId, {
			name: "dummy container name",
			foods: [food],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);

		const result = await useCase.execute({
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeTruthy();
	});

	it("Container not found", async () => {
		const result = await useCase.execute({
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});

	it("Food not found", async () => {
		const container: Container = Container.create(containerId, {
			name: "dummy container name",
			foods: [],
		}).unwrap();

		// TODO: add the mock container into the mock repo instead of using spy.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);
		const result = await useCase.execute({
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerDomainError);
	});
});
