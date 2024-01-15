import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import {
	FindAGroupInformationQuery,
	InvalidUUIDV4,
} from "src/Group/Query/FindAGroupInforamtion/FindAGroupInformationQuery";

describe("find a group information", () => {
	let mockNishikiDynamoDBClient: NishikiDynamoDBClient;
	let query: FindAGroupInformationQuery;

	const GROUP_INFORMATION = {
		groupId: "groupId",
		groupName: "groupName",
	};

	const GROUP_ID = "8a8bc459-779c-431f-9564-cf97b6662147";

	beforeEach(() => {
		mockNishikiDynamoDBClient = new NishikiDynamoDBClient();
		query = new FindAGroupInformationQuery(mockNishikiDynamoDBClient);
	});
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("Find a group", async () => {
		vi.spyOn(mockNishikiDynamoDBClient, "getGroup").mockReturnValueOnce(
			Promise.resolve(GROUP_INFORMATION),
		);

		const result = await query.execute({ groupId: GROUP_ID });

		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toEqual(GROUP_INFORMATION);
	});
	it("Not find a group, then returns null", async () => {
		vi.spyOn(mockNishikiDynamoDBClient, "getGroup").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await query.execute({ groupId: GROUP_ID });

		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toBeNull();
	});
	it("The group ID must be a valid UUID V4", async () => {
		const result = await query.execute({ groupId: "invalid ID" });
		expect(result.err).toBeTruthy();
		expect(result.unwrapError()).toBeInstanceOf(InvalidUUIDV4);
	});
});
