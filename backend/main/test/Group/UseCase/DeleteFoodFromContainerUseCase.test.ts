import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteFoodFromContainerUseCase } from "src/Group/UseCases/DeleteFoodFromContainerUseCase/DeleteFoodFromContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import {
	Container,
	ContainerDomainError,
	ContainerId,
} from "src/Group/Domain/Entities/Container";
import {
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/DeleteFoodFromContainerUseCase/IDeleteFoodFromContainerUseCase";
import { Food, FoodId } from "src/Group/Domain/Entities/Food";
import { GroupId, Group } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User";
import { MockGroupRepository } from "../MockGroupRepository";

const USER_ID = UserId.generate().id;

describe("delete a food from container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: DeleteFoodFromContainerUseCase;
	const userId = UserId.create(USER_ID).unwrap();

	const foodId = FoodId.create("dummyFoodId").unwrap();
	const food = Food.create(foodId, {
		name: "dummy food name",
	}).unwrap();

	const containerId = ContainerId.create("dummyId").unwrap();
	const container = Container.create(containerId, {
		name: "dummy container name",
		foods: [food],
	}).unwrap();

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
		useCase = new DeleteFoodFromContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("delete a food from a exiting container", async () => {
		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: userId.id,
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeTruthy();
	});

	it("Container not found in any Group", async () => {
		const groupWithoutContainer = Group.create(groupId, {
			name: groupName,
			containerIds: [],
			userIds: [userId],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(groupWithoutContainer);

		const result = await useCase.execute({
			userId: userId.id,
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(GroupIsNotExisting);
	});

	it("Food not found", async () => {
		const containerWithNoFood: Container = Container.create(containerId, {
			name: "dummy container name",
			foods: [],
		}).unwrap();

		mockContainerRepository.pushDummyData(containerWithNoFood);
		mockGroupRepository.pushDummyData(group);
		const result = await useCase.execute({
			userId: userId.id,
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerDomainError);
	});
	it("User is not authorized", async () => {
		const USER_ID_2 = UserId.generate().id;
		const userId_2 = UserId.create(USER_ID_2).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: userId_2.id,
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
		await expect(mockContainerRepository.find(containerId)).resolves.toBe(
			container,
		);
	});
});
