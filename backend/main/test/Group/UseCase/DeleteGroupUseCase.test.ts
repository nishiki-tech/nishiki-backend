import { afterEach, describe, expect, it, vi } from "vitest";
import {
	DeleteGroupUseCase,
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/DeleteGroupUseCase/DeleteGroupUseCase";
import { MockGroupRepository } from "test/Group/MockGroupRepository";
import { UserId, UserIdDomainError } from "src/User/Domain/Entity/User";
import {
	Group,
	GroupId,
	GroupIdDomainError,
} from "src/Group/Domain/Entities/Group";

describe("delete group use case", () => {
	const USER_ID = "a86a1cf6-f490-4684-89a1-2ce4148c0301";
	const GROUP_ID = USER_ID;
	const mockRepository = new MockGroupRepository();
	const useCase = new DeleteGroupUseCase(mockRepository);

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("normal system", () => {
		it("delete group successfully", async () => {
			vi.spyOn(mockRepository, "find").mockResolvedValueOnce(
				Group.create(GroupId.create(GROUP_ID).unwrap(), {
					name: "group name",
					containerIds: [],
					userIds: [UserId.create(USER_ID).unwrap()],
				}).unwrap(),
			);
			const result = await useCase.execute({
				userId: USER_ID,
				groupId: GROUP_ID,
			});
			expect(result.ok).toBeTruthy();
		});
	});
	describe("abnormal system", () => {
		it("user id is not correct", async () => {
			const result = await useCase.execute({
				userId: "wrong id",
				groupId: GROUP_ID,
			});
			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).toBeInstanceOf(UserIdDomainError);
		});
		it("group id is not correct", async () => {
			const result = await useCase.execute({
				userId: USER_ID,
				groupId: "wrong id",
			});
			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).toBeInstanceOf(GroupIdDomainError);
		});
		it("group not found", async () => {
			vi.spyOn(mockRepository, "find").mockResolvedValueOnce(null);
			const result = await useCase.execute({
				userId: USER_ID,
				groupId: GROUP_ID,
			});
			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).toBeInstanceOf(GroupIsNotExisting);
		});
		it("user doesn't have permission to delete group", async () => {
			vi.spyOn(mockRepository, "find").mockResolvedValueOnce(
				Group.create(GroupId.create(GROUP_ID).unwrap(), {
					name: "group name",
					containerIds: [],
					userIds: [],
				}).unwrap(),
			);
			const result = await useCase.execute({
				userId: USER_ID,
				groupId: GROUP_ID,
			});
			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).toBeInstanceOf(UserIsNotAuthorized);
		});
	});
});
