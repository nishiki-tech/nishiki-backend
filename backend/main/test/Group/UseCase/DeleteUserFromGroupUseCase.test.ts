import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteUserFromGroupUseCase } from "src/Group/UseCases/DeleteUserFromGroupUseCase/DeleteUserFromGroupUseCase";
import { MockGroupRepository } from "../MockGroupRepository";
import {
	Group,
	GroupDomainError,
	GroupId,
} from "src/Group/Domain/Entities/Group";
import {
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/DeleteUserFromGroupUseCase/IDeleteUserFromGroupUseCase";
import { UserId } from "src/User";

const USER_ID = UserId.generate();

describe("delete a user from group use case", () => {
	let mockGroupRepository: MockGroupRepository;
	let useCase: DeleteUserFromGroupUseCase;

	const targetUserId = UserId.generate();

	const groupId = GroupId.generate();
	const groupName = "dummyGroupName";
	const group = Group.create(groupId, {
		name: groupName,
		containerIds: [],
		userIds: [USER_ID, targetUserId],
	}).unwrap();

	const deleteUserProp = {
		userId: USER_ID.id,
		groupId: groupId.id,
		targetUserId: targetUserId.id,
	};

	beforeEach(() => {
		mockGroupRepository = new MockGroupRepository();
		useCase = new DeleteUserFromGroupUseCase(mockGroupRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("delete a user from a exiting group", async () => {
		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			...deleteUserProp,
		});
		expect(result.ok).toBeTruthy();
	});

	it("Group not found", async () => {
		const result = await useCase.execute({
			...deleteUserProp,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(GroupIsNotExisting);
	});

	it("User not found", async () => {
		const anotherUserId = UserId.generate().id;

		mockGroupRepository.pushDummyData(group);
		const result = await useCase.execute({
			...deleteUserProp,
			targetUserId: anotherUserId,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(GroupDomainError);
	});
	it("User is not authorized", async () => {
		const anotherUserId = UserId.generate().id;

		mockGroupRepository.pushDummyData(group);

		const result = await useCase.execute({
			...deleteUserProp,
			userId: anotherUserId,
		});

		const groupInRepository = await mockGroupRepository.find(groupId);
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
		expect(groupInRepository?.userIds[0].id).toBe(USER_ID.id);
	});
});
