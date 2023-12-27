import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateGroupNameUseCase } from "src/Group/UseCases/UpdateGroupNameUseCase/UpdateGroupNameUseCase";
import { MockGroupRepository } from "../MockGroupRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User";
import {
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/UpdateGroupNameUseCase/IUpdateGroupNameUseCase";

const USER_ID = UserId.generate();

describe("update group name use case", () => {
	let mockGroupRepository: MockGroupRepository;
	let useCase: UpdateGroupNameUseCase;

	const groupId = GroupId.generate();
	const groupName = "dummyGroupName";
	const group = Group.create(groupId, {
		name: groupName,
		containerIds: [],
		userIds: [USER_ID],
	}).unwrap();

	beforeEach(() => {
		mockGroupRepository = new MockGroupRepository();
		useCase = new UpdateGroupNameUseCase(mockGroupRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("change exiting group'name", async () => {
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: USER_ID.id,
			groupId: groupId.id,
			name: "new name",
		});
		const newGroup = await mockGroupRepository.find(groupId);

		expect(result.ok).toBeTruthy();
		expect(newGroup?.name).toBe("new name");
	});

	it("Group not found", async () => {
		const anotherGroupId = GroupId.generate();

		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: USER_ID.id,
			groupId: anotherGroupId.id,
			name: "new name",
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(GroupIsNotExisting);
	});
	it("User is not authorized", async () => {
		const anotherUserId = UserId.generate().id;

		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			userId: anotherUserId,
			groupId: groupId.id,
			name: "new name",
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
		await expect(mockGroupRepository.find(groupId)).resolves.toBe(group);
	});
});
