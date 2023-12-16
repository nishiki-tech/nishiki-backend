import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteContainerUseCase } from "src/Group/UseCases/DeleteContainerUseCase/DeleteContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { MockGroupRepository } from "../MockGroupRepository";
import { UserId } from "src/User";
import { GroupId, Group } from "src/Group/Domain/Entities/Group";

const USER_ID = UserId.generate().id;

describe("delete container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: DeleteContainerUseCase;
	const userId = UserId.create(USER_ID).unwrap();

	const containerId = ContainerId.create("dummyId").unwrap();
	const container: Container = Container.default(containerId).unwrap();

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
		useCase = new DeleteContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
		mockGroupRepository.pushDummyData(group);
		mockContainerRepository.pushDummyData(container);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("delete container", async () => {
		const result = await useCase.execute({
			userId: userId.id,
			containerId: "dummyId",
		});
		const newGroup = await mockGroupRepository.find(groupId);
		expect(result.ok).toBeTruthy();
		await expect(mockContainerRepository.find(containerId)).resolves.toBe(null);
		await expect(newGroup?.containerIds.length).toBe(0);
	});
	it("User is not authorized", async () => {
		const USER_ID_2 = UserId.generate().id;
		const userId_2 = UserId.create(USER_ID_2).unwrap();

		const result = await useCase.execute({
			userId: userId_2.id,
			containerId: "dummyId",
		});
		expect(result.ok).toBeFalsy();
		await expect(mockContainerRepository.find(containerId)).resolves.toBe(
			container,
		);
		await expect(mockGroupRepository.find(groupId)).resolves.toBe(group);
	});
});
