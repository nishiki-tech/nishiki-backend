import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddFoodToContainerUseCase } from "src/Group/UseCases/AddFoodToContainerUseCase/AddFoodToContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { ContainerIsNotExisting } from "src/Group/UseCases/AddFoodToContainerUseCase/IAddFoodToContainerUseCase";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";

describe("add a food to container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let useCase: AddFoodToContainerUseCase;

	const containerId = ContainerId.create("dummyId").unwrap();

	const unit = Unit.create({ name: "dummy unit" }).unwrap();
	const quantity = Quantity.create(1).unwrap();
	const expiry = Expiry.create({ date: new Date() }).unwrap();
	const foodName = "dummy food name";

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		useCase = new AddFoodToContainerUseCase(mockContainerRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("add food to a exiting container", async () => {
		const container: Container = Container.default(containerId).unwrap();

		mockContainerRepository.pushDummyData(container);

		const result = await useCase.execute({
			containerId: containerId.id,
			name: foodName,
			unit: unit.name,
			quantity: quantity.quantity,
			expiry: expiry.date,
		});
		expect(result.ok).toBeTruthy();
	});

	it("Container not found", async () => {
		const result = await useCase.execute({
			containerId: containerId.id,
			name: foodName,
			unit: unit.name,
			quantity: quantity.quantity,
			expiry: expiry.date,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});
});
