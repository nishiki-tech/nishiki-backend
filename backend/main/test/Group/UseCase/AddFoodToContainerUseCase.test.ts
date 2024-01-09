import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddFoodToContainerUseCase } from "src/Group/UseCases/AddFoodToContainerUseCase/AddFoodToContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import {
	ContainerIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/AddFoodToContainerUseCase/IAddFoodToContainerUseCase";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";
import { MockGroupRepository } from "../MockGroupRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User";

const USER_ID = UserId.generate();

describe("add a food to container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: AddFoodToContainerUseCase;

	const containerId = ContainerId.generate();
	const container: Container = Container.default(containerId).unwrap();

	const unit = Unit.create({ name: "dummy unit" }).unwrap();
	const quantity = Quantity.create(1).unwrap();
	const expiry = Expiry.create({ date: new Date() }).unwrap();
	const foodName = "dummy food name";
	const category = "dummy category";

	const groupId = GroupId.generate();
	const groupName = "dummyGroupName";
	const group = Group.create(groupId, {
		name: groupName,
		containerIds: [containerId],
		userIds: [USER_ID],
	}).unwrap();

	const addFoodRequest = {
		userId: USER_ID.id,
		containerId: containerId.id,
		name: foodName,
		unit: unit.name,
		quantity: quantity.quantity,
		expiry: expiry.date,
		category: category,
	};

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		mockGroupRepository = new MockGroupRepository();
		useCase = new AddFoodToContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("add food to a exiting container", async () => {
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve(container),
		);

		const result = await useCase.execute(addFoodRequest);
		expect(result.ok).toBeTruthy();
	});

	it("Container not found", async () => {
		const result = await useCase.execute(addFoodRequest);
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});
	it("Group not found", async () => {
		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve(container),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);
		const result = await useCase.execute(addFoodRequest);
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).toBeInstanceOf(ContainerIsNotExisting);
	});
	it("User is not authorized", async () => {
		const anotherUserId = UserId.generate().id;

		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve(container),
		);

		const result = await useCase.execute({
			...addFoodRequest,
			userId: anotherUserId,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
	});
});
