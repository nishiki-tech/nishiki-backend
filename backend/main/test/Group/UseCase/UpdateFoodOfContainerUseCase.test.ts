import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateFoodOfContainerUseCase } from "src/Group/UseCases/UpdateFoodOfContainerUseCase/UpdateFoodOfContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import {
	Container,
	ContainerDomainError,
	ContainerId,
} from "src/Group/Domain/Entities/Container";
import { MockGroupRepository } from "../MockGroupRepository";
import { UserId } from "src/User";
import { GroupId, Group } from "src/Group/Domain/Entities/Group";
import {
	ContainerIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/UpdateFoodOfContainerUseCase/IUpdateFoodOfContainerUseCase";
import { Food, FoodId } from "src/Group/Domain/Entities/Food";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";

const USER_ID = UserId.generate();

describe("update a food of a container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: UpdateFoodOfContainerUseCase;

	const foodId = FoodId.create("103ede0c-13e7-4d46-b8d7-42c326af1484").unwrap();
	const foodName = "dummyFoodName";
	const quantity = 1;
	const expiry = new Date();
	const unit = "dummyUnit";
	const createdAt = new Date();
	const food = Food.create(foodId, {
		name: foodName,
		quantity: Quantity.create(quantity).unwrap(),
		expiry: Expiry.create({ date: expiry }).unwrap(),
		unit: Unit.create({ name: unit }).unwrap(),
		category: "dummyCategory",
		createdAt: createdAt,
	}).unwrap();

	const containerId = ContainerId.generate();
	const containerName = "dummyContainerName";

	const groupId = GroupId.generate();
	const groupName = "dummyGroupName";

	const UpdateFoodRequiredProps = {
		userId: USER_ID.id,
		containerId: containerId.id,
		foodId: foodId.id,
		name: "new name",
		category: "new category",
		createdAt: createdAt,
	};

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		mockGroupRepository = new MockGroupRepository();
		useCase = new UpdateFoodOfContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("change exiting food", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [USER_ID],
		}).unwrap();

		const container: Container = Container.create(containerId, {
			name: containerName,
			foods: [food],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			...UpdateFoodRequiredProps,
			unit: "new unit",
			quantity: 2,
			expiry: new Date(),
		});
		const newContainer = await mockContainerRepository.find(containerId);

		expect(result.ok).toBeTruthy();
		expect(newContainer?.foods[0].name).toBe("new name");
	});

	it("food does not exist", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [USER_ID],
		}).unwrap();

		const container: Container = Container.create(containerId, {
			name: containerName,
			foods: [],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			...UpdateFoodRequiredProps,
			unit: "new unit",
			quantity: 2,
			expiry: new Date(),
		});

		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).toBeInstanceOf(ContainerDomainError);
	});

	it("Container not found in any group", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [],
			userIds: [USER_ID],
		}).unwrap();

		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute(UpdateFoodRequiredProps);
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});

	it("User is not authorized", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [USER_ID],
		}).unwrap();

		const container: Container = Container.create(containerId, {
			name: containerName,
			foods: [food],
		}).unwrap();

		const anotherUserId = UserId.generate().id;

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			...UpdateFoodRequiredProps,
			userId: anotherUserId,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
		await expect(mockContainerRepository.find(containerId)).resolves.toBe(
			container,
		);
	});
});
