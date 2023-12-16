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
import { GroupId, Group } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User";
import { MockGroupRepository } from "../MockGroupRepository";

const USER_ID = UserId.generate().id;

describe("delete a food from container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: DeleteFoodFromContainerUseCase;
	const userId = UserId.create(USER_ID).unwrap();

	const containerId = ContainerId.create("dummyId").unwrap();
	const container: Container = Container.default(containerId).unwrap();
	const foodId = FoodId.create("dummyFoodId").unwrap();

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
		const food = Food.create(foodId, {
			name: "dummy food name",
		}).unwrap();
		const container: Container = Container.create(containerId, {
			name: "dummy container name",
			foods: [food],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);

		const result = await useCase.execute({
			userId: userId.id,
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeTruthy();
	});

	it("Container not found", async () => {
		const result = await useCase.execute({
			userId: userId.id,
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
			userId: userId.id,
			containerId: containerId.id,
			foodId: foodId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerDomainError);
	});
});
