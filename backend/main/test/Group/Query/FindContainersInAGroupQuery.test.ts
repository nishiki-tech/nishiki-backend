import { vi, describe, it, beforeEach, expect } from "vitest";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import {
	FindContainersInAGroupQuery,
	InvalidUUId,
	GroupNotFound,
} from "src/Group/Query/FindContainersInAGroupQuery/FindContainersInAGroupQuery";

describe("Find containers in a group", () => {
	let nishikiDynamoDb: NishikiDynamoDBClient;
	let query: FindContainersInAGroupQuery;

	const GROUP_ID = "e7e5b821-2e96-4042-81b5-ae62cf9a7559";

	beforeEach(() => {
		nishikiDynamoDb = new NishikiDynamoDBClient();
		query = new FindContainersInAGroupQuery(nishikiDynamoDb);
	});

	it("invalid id", async () => {
		const result = await query.execute({ groupId: "invalid_id" });
		expect(result.err).toBeTruthy();
		expect(result.unwrapError()).toBeInstanceOf(InvalidUUId);
	});

	it("a group is not found", async () => {
		vi.spyOn(nishikiDynamoDb, "listOfContainers").mockReturnValueOnce(
			Promise.resolve([]),
		);
		vi.spyOn(nishikiDynamoDb, "getGroup").mockReturnValueOnce(
			Promise.resolve(null),
		);
		const result = await query.execute({ groupId: GROUP_ID });
		expect(result.err).toBeTruthy();
		expect(result.unwrapError()).toBeInstanceOf(GroupNotFound);
	});

	it("no containers information has found", async () => {
		vi.spyOn(nishikiDynamoDb, "listOfContainers").mockReturnValueOnce(
			Promise.resolve(["container-id"]),
		);
		vi.spyOn(nishikiDynamoDb, "getGroup").mockReturnValueOnce(
			Promise.resolve({ groupId: "", groupName: "" }),
		);
		vi.spyOn(nishikiDynamoDb, "getContainer").mockReturnValueOnce(
			Promise.resolve(null),
		);
		const result = await query.execute({ groupId: GROUP_ID });
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual({ containers: [] });
	});
});
