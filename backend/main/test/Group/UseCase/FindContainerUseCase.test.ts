import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindContainerUseCase } from "src/Group/UseCases/FindContainerUseCase/FindContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { containerDtoMapper } from "src/Group/Dtos/ContainerDto";
import { UserId } from "src/User";
import { MockGroupRepository } from "../MockGroupRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { UserIsNotAuthorized } from "src/Group/UseCases/FindContainerUseCase/IFindContainerUseCase";
import { containerWithGroupDtoMapper } from "src/Group/Dtos/ContainerWithGroupDto";

const USER_ID = UserId.generate();

describe("find container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: FindContainerUseCase;

	const containerId = ContainerId.create("dummyId").unwrap();
	const container: Container = Container.default(containerId).unwrap();

	const groupId = GroupId.create("dummyGroupId").unwrap();
	const groupName = "dummyGroupName";

	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		mockGroupRepository = new MockGroupRepository();
		useCase = new FindContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("Find exiting container", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [USER_ID],
		}).unwrap();

		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);

		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: containerId.id,
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual(
			containerWithGroupDtoMapper(container, group),
		);
	});

	it("Container not found", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [],
			userIds: [USER_ID],
		}).unwrap();

		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);
		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: "dummyId",
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toBeNull();
	});
	it("Group not found", async () => {
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(container),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);
		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: "dummyId",
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toBeNull();
	});
	it("User is not authorized", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [containerId],
			userIds: [USER_ID],
		}).unwrap();

		const anotherUserId = UserId.generate().id;

		vi.spyOn(mockContainerRepository, "find").mockReturnValue(
			Promise.resolve(container),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValue(
			Promise.resolve(group),
		);
		const result = await useCase.execute({
			userId: anotherUserId,
			containerId: containerId.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
		await expect(mockContainerRepository.find(containerId)).resolves.toBe(
			container,
		);
	});
});
