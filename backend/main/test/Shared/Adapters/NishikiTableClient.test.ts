import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { dynamoTestClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { userData } from "./TestData/User";
import { groupData } from "test/Shared/Adapters/TestData/Group";

const NISHIKI_TEST_TABLE_NAME = "Nishiki-DB";
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
				const result = await nishikiClient.getUser(user.userId);
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
				const result = await nishikiClient.getUser(user.userId);
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
	});
});