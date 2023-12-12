import { describe, expect, it } from "vitest";
import { dynamoTestClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { userData } from "./TestData/User";
import { groupData } from "test/Shared/Adapters/TestData/Group";

const NISHIKI_TEST_TABLE_NAME = "Nishiki-DB";
const nishikiClient = new NishikiDynamoDBClient(
	dynamoTestClient,
	NISHIKI_TEST_TABLE_NAME,
);

describe.sequential("users operation", () => {
	it("save user data", async () => {
		await Promise.all(
			userData.userInput.map((el) => nishikiClient.saveUser(el)),
		);
		// check if the error occur.
		expect(true).toBeTruthy();
	});

	it("get user data", async () => {
		for (const user of userData.userInput) {
			const result = await nishikiClient.getUser(user.userId);
			expect(result).toEqual(user);
		}
	});

	it("delete user data", async () => {
		for (const user of userData.userInput) {
			await nishikiClient.deleteUser(user.userId);
			const result = await nishikiClient.getUser(user.userId);
			expect(result).toBeNull();
		}
	});
});

describe.sequential("groups operation", () => {
	it("save group data", async () => {
		await Promise.all(
			groupData.groupData.map((el) =>
				nishikiClient.saveGroup(el.groupId, {
					groupName: el.groupName,
					userIds: el.users,
					containers: el.containers,
				}),
			),
		);

		expect(true).toBeTruthy();
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

			expect(usersIds.length).toBe(2);
			expect(usersIds.map(el => el.userId).sort()).toEqual(containsUsersGroup.users!.sort());
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