import { beforeEach, describe, expect, it, vi } from "vitest";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import {
	FindUsersBelongingToAGroupQuery,
	InvalidUUIDV4,
} from "src/Group/Query/FindUsersBelongingToAGroupQuery/FindUsersBelongingToAGroupQuery";

describe("Find Users Belonging to a group query", () => {
	let nishikiDynamoDBClient: NishikiDynamoDBClient;
	let query: FindUsersBelongingToAGroupQuery;

	const GROUP_ID = "3139d46d-54c7-4b65-9356-efd63252ffda";

	beforeEach(() => {
		nishikiDynamoDBClient = new NishikiDynamoDBClient();
		query = new FindUsersBelongingToAGroupQuery(nishikiDynamoDBClient);
	});

	it("get users", async () => {
		vi.spyOn(nishikiDynamoDBClient, "listOfUsersInGroup").mockReturnValueOnce(
			Promise.resolve([
				{ userId: "1", SK: "1" },
				{ userId: "2", SK: "2" },
			]),
		);
		vi.spyOn(nishikiDynamoDBClient, "getUser").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve({
				userId: "1",
				username: "1",
				emailAddress: "1",
			}),
		);
		vi.spyOn(nishikiDynamoDBClient, "getUser").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve({
				userId: "2",
				username: "2",
				emailAddress: "2",
			}),
		);

		const result = await query.execute({ groupId: GROUP_ID });

		expect(result.ok).toBeTruthy();
		expect(result.unwrap().sort((a, b) => (a.id < b.id ? -1 : 1))).toEqual(
			[
				{ id: "1", name: "1" },
				{ id: "2", name: "2" },
			].sort((a, b) => (a.id < b.id ? -1 : 1)),
		);
	});

	it("users not found", async () => {
		vi.spyOn(nishikiDynamoDBClient, "listOfUsersInGroup").mockReturnValueOnce(
			Promise.resolve([
				{ userId: "1", SK: "1" },
				{ userId: "2", SK: "2" },
			]),
		);
		vi.spyOn(nishikiDynamoDBClient, "getUser").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve(null),
		);
		vi.spyOn(nishikiDynamoDBClient, "getUser").mockReturnValueOnce(
			// @ts-ignore
			Promise.resolve(null),
		);

		const result = await query.execute({ groupId: GROUP_ID });
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual([]);
	});

	it("group doesn't have any users", async () => {
		vi.spyOn(nishikiDynamoDBClient, "listOfUsersInGroup").mockReturnValueOnce(
			Promise.all([]),
		);

		const result = await query.execute({ groupId: GROUP_ID });
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual([]);
	});

	it("invalid Group ID is requested", async () => {
		const result = await query.execute({ groupId: "invalidID" });
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).toBeInstanceOf(InvalidUUIDV4);
	});
});
