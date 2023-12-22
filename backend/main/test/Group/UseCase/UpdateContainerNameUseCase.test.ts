import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { MockGroupRepository } from "../MockGroupRepository";
import { UserId } from "src/User";
import { GroupId, Group } from "src/Group/Domain/Entities/Group";
import {
	ContainerIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/UpdateContainerNameUseCase/IUpdateContainerNameUseCase";

const USER_ID = UserId.generate();

describe("update container name use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: UpdateContainerNameUseCase;

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
			userIds: [USER_ID],
		}).unwrap();

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: USER_ID.id,
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
			userIds: [USER_ID],
		}).unwrap();

		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: "dummy Id",
			name: "new name",
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(ContainerIsNotExisting);
	});
	it("User is not authorized", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [USER_ID],
		}).unwrap();

		const anotherUserId = UserId.generate().id;

		mockContainerRepository.pushDummyData(container);
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: anotherUserId,
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
