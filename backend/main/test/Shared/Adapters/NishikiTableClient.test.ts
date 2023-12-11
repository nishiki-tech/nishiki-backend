import { describe, expect, it } from "vitest";
import { dynamoTestClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { userData } from "./TestData/User";

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

	it("get user data by a user's email address", async () => {
		for (const user of userData.userInput) {
			const result = await nishikiClient.getUserIdByEmail(user.emailAddress);
			expect(result).toEqual(user.userId);
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
