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

const USER_ID = UserId.generate().id;

describe("add a food to container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: AddFoodToContainerUseCase;
	const userId = UserId.create(USER_ID).unwrap();

	const containerId = ContainerId.create("dummyId").unwrap();
	const container: Container = Container.default(containerId).unwrap();

	const unit = Unit.create({ name: "dummy unit" }).unwrap();
	const quantity = Quantity.create(1).unwrap();
	const expiry = Expiry.create({ date: new Date() }).unwrap();
	const foodName = "dummy food name";

	const groupId = GroupId.create("dummyGroupId").unwrap();
	const groupName = "dummyGroupName";
	const group = Group.create(groupId, {
		name: groupName,
		containerIds: [containerId],
		userIds: [userId],
	}).unwrap();

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
		vi.spyOn(mockGroupRepository, "findByContainerId").mockReturnValueOnce(
			Promise.resolve(group),
		);
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);

		const result = await useCase.execute({
			userId: userId.id,
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
			userId: userId.id,
			containerId: containerId.id,
			name: foodName,
			unit: unit.name,
			quantity: quantity.quantity,
			expiry: expiry.date,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});

	it("User is not authorized", async () => {
		const USER_ID_2 = UserId.generate().id;
		const userId_2 = UserId.create(USER_ID_2).unwrap();

		vi.spyOn(mockGroupRepository, "findByContainerId").mockReturnValueOnce(
			Promise.resolve(group),
		);
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);

		const result = await useCase.execute({
			userId: userId_2.id,
			containerId: containerId.id,
			name: foodName,
			unit: unit.name,
			quantity: quantity.quantity,
			expiry: expiry.date,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
	});
});
