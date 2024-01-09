import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MockGroupRepository } from "test/Group/MockGroupRepository";
import {
	TestDynamoDBClient,
	testDynamoDBClient,
} from "test/Shared/Adapters/DynamoDBTestClient";
import {
	GroupNotFound,
	HashNotFound,
	InvitationHashService,
	InvitationLinkExpired,
	PermissionError,
	UserIdError,
	UserNotFound,
} from "src/Services/InvitationHashService/InvitationHashService";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import Md5 from "crypto-js/md5";
import {
	InvitationLink,
	UserData,
} from "src/Shared/Adapters/DB/NishikiDBTypes";

describe.sequential("generate a new invitation link", () => {
	let mockGroupRepository: MockGroupRepository;
	let nishikiDynamoDBClient: TestDynamoDBClient;
	let nishikiClient: NishikiDynamoDBClient;
	let service: InvitationHashService;
	const TABLE_NAME = "Generate-Hash-Table";

	const groupId = GroupId.create(
		"6f5b3fab-5dc3-4e0a-8bcc-c514f8d5e75a",
	).unwrap();
	const userId = UserId.create("de281137-bdac-422f-9013-fd03dfae32f5").unwrap();
	const group = Group.create(groupId, {
		name: "testName",
		containerIds: [
			ContainerId.create("ed06f4b9-2274-47ff-85aa-5c18e2f8e00c").unwrap(),
			ContainerId.create("a0b59426-684f-47a8-9ffe-f3eb4fd470e9").unwrap(),
		],
		userIds: [userId],
	}).unwrap();

	beforeEach(async () => {
		mockGroupRepository = new MockGroupRepository();
		nishikiDynamoDBClient = testDynamoDBClient(TABLE_NAME);
		nishikiClient = new NishikiDynamoDBClient(
			nishikiDynamoDBClient,
			TABLE_NAME,
		);
		service = new InvitationHashService(nishikiClient, mockGroupRepository);
		await nishikiDynamoDBClient.createTestTable();
	});

	afterEach(async () => {
		vi.clearAllMocks();
		await nishikiDynamoDBClient.deleteTestTable();
	});

	describe("Normal system", () => {
		const hash = Md5("dummy").toString();

		beforeEach(() => {
			vi.useFakeTimers();
			vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
				Promise.resolve(group),
			);
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("when hash doesn't exist", async () => {
			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				Promise.resolve(null),
			);

			const result = await service.generateAnInvitationHash({
				groupId: groupId.id,
				userId: userId.id,
			});

			expect(result.ok).toBeTruthy();
		});

		it("hash exist and expiry datetime doesn't exceeded", async () => {
			const now = new Date(1984, 3, 4);
			vi.setSystemTime(now);

			const linkExpiryTime = structuredClone(now);
			linkExpiryTime.setHours(linkExpiryTime.getHours() + 1); // 1 hour

			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				Promise.resolve({
					groupId: groupId.id,
					SK: "InvitationLinkHash",
					linkExpiryTime,
					invitationLinkHash: hash,
				}),
			);
			const deleteInvitationLink = vi.spyOn(
				nishikiClient,
				"deleteInvitationLink",
			);

			const result = await service.generateAnInvitationHash({
				groupId: groupId.id,
				userId: userId.id,
			});

			const expectedDatetime = structuredClone(now);
			expectedDatetime.setHours(expectedDatetime.getHours() + 24);

			expect(result.ok).toBeTruthy();
			expect(result.unwrap().hash).toBe(hash);
			expect(result.unwrap().expiryDatetime).toEqual(expectedDatetime);
			expect(deleteInvitationLink).not.toHaveBeenCalled();
		});

		it("hash exist and expiry datetime exceed", async () => {
			const now = new Date(1984, 3, 4);
			vi.setSystemTime(now);

			const linkExpiryTime = structuredClone(now);
			linkExpiryTime.setHours(linkExpiryTime.getHours() - 48); // before 2 day

			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				Promise.resolve({
					groupId: groupId.id,
					SK: "InvitationLinkHash",
					linkExpiryTime,
					invitationLinkHash: hash,
				}),
			);
			const deleteInvitationLink = vi.spyOn(
				nishikiClient,
				"deleteInvitationLink",
			);

			const result = await service.generateAnInvitationHash({
				groupId: groupId.id,
				userId: userId.id,
			});

			const expectedDatetime = structuredClone(now);
			expectedDatetime.setHours(expectedDatetime.getHours() + 24);

			expect(result.ok).toBeTruthy();
			expect(result.unwrap().hash).not.toBe(hash);
			expect(result.unwrap().expiryDatetime).toEqual(expectedDatetime);
			expect(deleteInvitationLink).toHaveBeenCalledTimes(1);
		});
	});

	describe("Abnormal system", async () => {
		it("group not found", async () => {
			vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
				Promise.resolve(null),
			);

			const result = await service.generateAnInvitationHash({
				groupId: groupId.id,
				userId: userId.id,
			});

			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).instanceOf(GroupNotFound);
		});

		it("the requesting user doesn't belong to the group", async () => {
			vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
				Promise.resolve(group),
			);

			const userIdNotBelongToGroup = UserId.create(
				"9e5f7375-cff5-4387-8c59-551aee5d2277",
			).unwrap();

			const result = await service.generateAnInvitationHash({
				groupId: groupId.id,
				userId: userIdNotBelongToGroup.id,
			});

			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).instanceOf(PermissionError);
		});
	});
});

describe.sequential("Join to the group using the invitation link hash", () => {
	let mockGroupRepository: MockGroupRepository;
	let nishikiDynamoDBClient: TestDynamoDBClient;
	let nishikiClient: NishikiDynamoDBClient;
	let service: InvitationHashService;
	const TABLE_NAME = "Join-To-Group-Using-Hash";

	const groupId = GroupId.create(
		"6f5b3fab-5dc3-4e0a-8bcc-c514f8d5e75a",
	).unwrap();
	const userId = "de281137-bdac-422f-9013-fd03dfae32f5";
	const dummyInvitationLinkHash = Md5("dummy").toString();

	beforeEach(async () => {
		mockGroupRepository = new MockGroupRepository();
		nishikiDynamoDBClient = testDynamoDBClient(TABLE_NAME);
		nishikiClient = new NishikiDynamoDBClient(
			nishikiDynamoDBClient,
			TABLE_NAME,
		);
		service = new InvitationHashService(nishikiClient, mockGroupRepository);
		vi.useFakeTimers();
	});

	afterEach(async () => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	describe("Normal system", () => {
		it("a user is added to the group", async () => {
			// invitation link can be found
			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				invitationLinkHashReturnData,
			);
			// user data can be found
			vi.spyOn(nishikiClient, "getUser").mockReturnValueOnce(
				// @ts-ignore
				userDataReturnData,
			);
			vi.spyOn(nishikiClient, "saveGroup").mockReturnValueOnce(
				Promise.resolve(),
			);

			// current DateTime is one hour before
			const fakedNow = new Date();
			fakedNow.setHours(fakedNow.getHours() - 1);
			vi.setSystemTime(fakedNow);

			const result = await service.joinToGroupUsingAnInvitationHash(
				dummyInvitationLinkHash,
				userId,
			);

			expect(result.ok).toBeTruthy();
			expect(result.unwrap()).toEqual({
				groupId: groupId.id,
			});
		});
	});

	describe("Abnormal system", () => {
		it("an incorrect user id is provided", async () => {
			const result = await service.joinToGroupUsingAnInvitationHash(
				"hash",
				"incorrect-user-id",
			);
			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).instanceOf(UserIdError);
		});
		it("a user is not found", async () => {
			// invitation link can be found
			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				invitationLinkHashReturnData,
			);
			// user data can't be found
			vi.spyOn(nishikiClient, "getUser").mockReturnValueOnce(
				// @ts-ignore
				Promise.resolve(null),
			);

			const result = await service.joinToGroupUsingAnInvitationHash(
				dummyInvitationLinkHash,
				userId,
			);

			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).instanceOf(UserNotFound);
		});
		it("an invitation link is not found", async () => {
			// invitation link can't be found
			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				Promise.resolve(null),
			);
			// user data can be found
			vi.spyOn(nishikiClient, "getUser").mockReturnValueOnce(
				// @ts-ignore
				userDataReturnData,
			);

			const result = await service.joinToGroupUsingAnInvitationHash(
				dummyInvitationLinkHash,
				userId,
			);

			expect(result.err).toBeTruthy();
			expect(result.unwrapError()).instanceOf(HashNotFound);
		});

		it("the link expiry time has been exceeded.", async () => {
			// invitation link can be found
			vi.spyOn(nishikiClient, "getInvitationLink").mockReturnValueOnce(
				invitationLinkHashReturnData,
			);
			// user data can be found
			vi.spyOn(nishikiClient, "getUser").mockReturnValueOnce(
				// @ts-ignore
				userDataReturnData,
			);
			vi.spyOn(nishikiClient, "saveGroup").mockReturnValueOnce(
				Promise.resolve(),
			);

			// current DateTime is one hour after
			const fakedNow = new Date();
			fakedNow.setHours(fakedNow.getHours() + 1);
			vi.setSystemTime(fakedNow);

			const result = await service.joinToGroupUsingAnInvitationHash(
				dummyInvitationLinkHash,
				userId,
			);

			expect(result.ok).toBeFalsy();
			expect(result.unwrapError()).instanceOf(InvitationLinkExpired);
		});
	});

	const invitationLinkHashReturnData: Promise<InvitationLink> = Promise.resolve(
		{
			groupId: groupId.id,
			SK: "InvitationLinkHash",
			linkExpiryTime: new Date(),
			invitationLinkHash: dummyInvitationLinkHash,
		},
	);
	const userDataReturnData: Promise<UserData> = Promise.resolve({
		userId: userId,
		username: "dummy-user",
		emailAddress: "dummy@nishiki.ninja",
	});
});
