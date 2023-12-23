import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { dynamoTestClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { userData } from "./TestData/User";
import { groupData } from "test/Shared/Adapters/TestData/Group";
import { containerData } from "./TestData/Container";
import { NISHIKI_TEST_TABLE_NAME } from "./DynamoDBTestClient";
import Md5 from "crypto-js/md5";

const nishikiClient = new NishikiDynamoDBClient(
	dynamoTestClient,
	NISHIKI_TEST_TABLE_NAME,
);

describe.sequential("DynamoDB test client", () => {
	describe.sequential("users operation", () => {
		beforeAll(async () => {
			await dynamoTestClient.createTestTable();
		});

		afterAll(async () => {
			await dynamoTestClient.deleteTestTable();
		});

		it("save user data", async () => {
			await Promise.all(
				userData.userInput.map((el) => nishikiClient.saveUser(el)),
			);
			// check if the error occur.
			expect(true).toBeTruthy();
		});

		it("get user data", async () => {
			for (const user of userData.userInput) {
				const result = await nishikiClient.getUser({
					userId: user.userId,
				});
				expect(result).toEqual(user);
			}
		});

		it("get user data by a user's email address", async () => {
			for (const user of userData.userInput) {
				const result = await nishikiClient.getUserIdByEmail(user.emailAddress);
				expect(result).toEqual(user.userId);
			}
		});

		it("delete user data", async () => {
			for (const user of userData.userInput) {
				await nishikiClient.deleteUser(user.userId);

				// check if the user is deleted.
				const result = await nishikiClient.getUser({
					userId: user.userId,
				});
				expect(result).toBeNull();

				const getUserByEmail = await nishikiClient.getUserIdByEmail(
					user.emailAddress,
				);
				expect(getUserByEmail).toBeNull();
			}
		});
	});

	describe.sequential("groups operation", () => {
		beforeAll(async () => {
			await dynamoTestClient.createTestTable();
		});

		afterAll(async () => {
			await dynamoTestClient.deleteTestTable();
		});

		it("save group data", async () => {
			await Promise.all(
				groupData.groupData.map((el) =>
					nishikiClient.saveGroup(el.groupId, {
						groupName: el.groupName,
						userIds: el.users,
						containerIds: el.containerIds,
					}),
				),
			);

			expect(true).toBeTruthy();
		});

		describe("get a list of users who belong to the requested group", () => {
			it("there are users belonging to group", async () => {
				const containsUsersGroup = groupData.groupData[0];

				const usersIds = await nishikiClient.listOfUsersInGroup(
					containsUsersGroup.groupId,
				);

				expect(usersIds.length).toBe(2);
				expect(usersIds.map((el) => el.userId).sort()).toEqual(
					containsUsersGroup.users!.sort(),
				);
			});

			it("there are NO users belonging to a group", async () => {
				const noUsersGroup = groupData.groupData[2];

				const usersIds = await nishikiClient.listOfUsersInGroup(
					noUsersGroup.groupId,
				);

				expect(usersIds.length).toBe(0);
				expect(usersIds).toEqual([]);
			});
		});

		describe("check existence of user, Checking GetUser method", () => {
			it("the user do belong to the Group", async () => {
				const containsUsersGroup = groupData.groupData[0];

				const userId = containsUsersGroup.users![0];
				const groupId = containsUsersGroup.groupId;

				const result = await nishikiClient.getUser({
					userId,
					groupId,
				});

				expect(result).toBeTruthy();
			});

			it("the user do NOT belong to the Group", async () => {
				const containsUsersGroup = groupData.groupData[2]; // no user's one

				const userId = groupData.groupData[0].users![0];
				const groupId = containsUsersGroup.groupId;

				const result = await nishikiClient.getUser({
					userId,
					groupId,
				});

				expect(result).toBeFalsy();
			});
		});

		it("get group data", async () => {
			for (const group of groupData.groupData) {
				const expectedGroup = {
					groupId: group.groupId,
					groupName: group.groupName,
				};

				const result = await nishikiClient.getGroup(group.groupId);

				expect(result).toEqual(expectedGroup);
			}
		});

		describe("get a list of users who belong to the requested group", () => {
			it("there are users belonging to group", async () => {
				const containsUsersGroup = groupData.groupData[0];

				const usersIds = await nishikiClient.listOfUsersInGroup(
					containsUsersGroup.groupId,
				);

				expect(usersIds.length).toBe(containsUsersGroup.users?.length);
				expect(usersIds.map((el) => el.userId).sort()).toEqual(
					containsUsersGroup.users!.sort(),
				);
			});

			it("there are NO users belonging to a group", async () => {
				const noUsersGroup = groupData.groupData[2];

				const usersIds = await nishikiClient.listOfUsersInGroup(
					noUsersGroup.groupId,
				);

				expect(usersIds.length).toBe(0);
				expect(usersIds).toEqual([]);
			});
		});
	});

	describe.sequential("join link expiry datetime", () => {
		beforeEach(async () => {
			await dynamoTestClient.createTestTable();
		});

		afterEach(async () => {
			await dynamoTestClient.deleteTestTable();
		});

		const GROUP_1 = groupData.groupData[0].groupId;
		const GROUP_2 = groupData.groupData[1].groupId;

		it("create a new join link expiry datetime", async () => {
			const linkHash = Md5(`${GROUP_1}`).toString();

			await nishikiClient.addInvitationLink(GROUP_1, new Date(), linkHash);

			// error won't occur
			expect(true).toBeTruthy();
		});

		it("using getInvitationLink, retrieves an invitation link by Hash data", async () => {
			const group1InvitationLink = Md5(
				`${GROUP_1}${new Date("1984-04-04T00:00:00").toDateString()}`,
			).toString();

			await Promise.all([
				nishikiClient.addInvitationLink(
					GROUP_1,
					new Date("1984-04-04T00:00:00"),
					group1InvitationLink,
				),
				nishikiClient.addInvitationLink(
					GROUP_2,
					new Date("1984-04-04T00:00:00"),
					Md5(
						`${GROUP_2}${new Date("1984-04-04T00:00:00").toDateString()}`,
					).toString(),
				),
			]);

			// search by GROUP_1
			const link = await nishikiClient.getInvitationLink(group1InvitationLink);

			expect(link).not.toBeNull();
			expect(link!.groupId).toBe(GROUP_1); // find GROUP_1
			expect(link!.linkExpiryTime).toEqual(new Date("1984-04-04T00:00:00"));
			expect(link!.invitationLinkHash).toBe(group1InvitationLink);
		});

		it("also, the getInvitationLink can accept the Group ID", async () => {
			// add links with different expiry dates to the same groups.
			await Promise.all([
				nishikiClient.addInvitationLink(
					GROUP_1,
					new Date("1984-04-03T00:00:00"),
					Md5(
						`${GROUP_1}${new Date("1984-04-03T00:00:00").toDateString()}`,
					).toString(),
				),
			]);

			const link = await nishikiClient.getInvitationLink(GROUP_1);

			expect(link).not.toBeNull();
			expect(link?.linkExpiryTime).toEqual(new Date("1984-04-03T00:00:00"));
		});

		it("delete an invitation link by the group ID", async () => {
			await Promise.all([
				nishikiClient.addInvitationLink(
					GROUP_1,
					new Date("2000-01-01T00:00:00"),
					Md5(
						`${GROUP_1}${new Date("1984-04-04T00:00:00").toDateString()}`,
					).toString(),
				),
			]);

			const group1InvitationLink =
				await nishikiClient.getInvitationLink(GROUP_1);
			expect(group1InvitationLink).not.toBeNull();

			await nishikiClient.deleteInvitationLink(GROUP_1);

			const deletedGroup1InvitationLink =
				await nishikiClient.getInvitationLink(GROUP_1);

			expect(deletedGroup1InvitationLink).toBeNull();
		});

		it("delete the invitation link by the Group ID", async () => {
			const invitationLink = Md5(
				`${GROUP_1}${new Date("1984-04-04T00:00:00").toDateString()}`,
			).toString();

			await nishikiClient.addInvitationLink(
				GROUP_1,
				new Date("2000-01-01T00:00:00"),
				invitationLink,
			);

			const group1InvitationLink =
				await nishikiClient.getInvitationLink(invitationLink);
			expect(group1InvitationLink).not.toBeNull();

			await nishikiClient.deleteInvitationLink(group1InvitationLink!);

			const deletedGroup1InvitationLink =
				await nishikiClient.getInvitationLink(invitationLink);

			expect(deletedGroup1InvitationLink).toBeNull();
		});
	});

	describe.sequential("container operation", () => {

		beforeAll(async () => {
			await dynamoTestClient.createTestTable();
		});

		afterAll(async () => {
			await dynamoTestClient.deleteTestTable();
		});

		it("put container data", async () => {

			for (const container of containerData.containerData) {
				await nishikiClient.saveContainer({
					containerId: container.containerId,
					containerName: container.containerName,
					foods: container.foods,
				});
			}

			expect(true).toBeTruthy();
		});

		it("get a container", async () => {
			const containerId =  containerData.containerData[0].containerId;

			const result = await nishikiClient.getContainer(containerId);
			expect(result).not.toBeNull();
			expect(result).toEqual(containerData.containerData[0])
		})
	});
});
