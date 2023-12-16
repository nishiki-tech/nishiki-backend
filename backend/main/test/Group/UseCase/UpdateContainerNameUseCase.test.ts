import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { MockGroupRepository } from "../MockGroupRepository";
import { UserId } from "src/User";
import { GroupId, Group } from "src/Group/Domain/Entities/Group";
import {
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/UpdateContainerNameUseCase/IUpdateContainerNameUseCase";

const USER_ID = UserId.generate().id;

describe("update container name use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: UpdateContainerNameUseCase;
	const userId = UserId.create(USER_ID).unwrap();

	const containerId = ContainerId.create("dummyId").unwrap();
	const container: Container = Container.default(containerId).unwrap();

	const groupId = GroupId.create("dummyGroupId").unwrap();
	const groupName = "dummyGroupName";

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		mockGroupRepository = new MockGroupRepository();
		useCase = new UpdateContainerNameUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("change exiting container'name", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [userId],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: userId.id,
			containerId: containerId.id,
			name: "new name",
		});
		const newContainer = await mockContainerRepository.find(containerId);

		expect(result.ok).toBeTruthy();
		expect(newContainer?.name).toBe("new name");
	});

	it("Container not found in any group", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [],
			userIds: [userId],
		}).unwrap();

		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: userId.id,
			containerId: "dummy Id",
			name: "new name",
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(GroupIsNotExisting);
	});
	it("User is not authorized", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [userId],
		}).unwrap();

		const USER_ID_2 = UserId.generate().id;
		const userId_2 = UserId.create(USER_ID_2).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: userId_2.id,
			containerId: containerId.id,
			name: "new name",
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
		await expect(mockContainerRepository.find(containerId)).resolves.toBe(
			container,
		);
	});
});
