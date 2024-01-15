import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
	FindGroupsInformationQuery,
	InvalidUUID
} from "src/Group/Query/FindGroupsInformation/FindGroupsInformatoinQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";

describe("Find groups information query", () => {
	let nishikiDynamoDBClient: NishikiDynamoDBClient;
	let query: FindGroupsInformationQuery;

	const USER_ID = "bff0d793-4596-4d25-9876-a55234224db8";

	beforeEach(() => {
		nishikiDynamoDBClient = new NishikiDynamoDBClient();
		query = new FindGroupsInformationQuery(nishikiDynamoDBClient);
	});
    afterEach(() => {
        vi.clearAllMocks();
    })

	it("get a list of groups information", async () => {
		vi.spyOn(nishikiDynamoDBClient, "listOfUsersGroup").mockReturnValueOnce(
			Promise.resolve([
				{ PK: "1", SK: "1", groupId: "1" },
				{ PK: "2", SK: "2", groupId: "2" },
			]),
		);
		vi.spyOn(nishikiDynamoDBClient, "getGroup").mockReturnValueOnce(
			Promise.resolve({ groupId: "1", groupName: "1" }),
		);
		vi.spyOn(nishikiDynamoDBClient, "getGroup").mockReturnValueOnce(
			Promise.resolve({ groupId: "2", groupName: "2" }),
		);

		const result = await query.execute({ userId: USER_ID });

		expect(result.ok).toBeTruthy();
		expect(
			result.unwrap().groups.sort((a, b) => (a.groupId > b.groupId ? 1 : -1)),
		).toEqual(
			[
				{ groupId: "1", groupName: "1" },
				{ groupId: "2", groupName: "2" },
			].sort((a, b) => (a.groupId > b.groupId ? 1 : -1)),
		);
	});
	it("user doesn't belong to any group", async () => {
        vi.spyOn(nishikiDynamoDBClient, "listOfUsersGroup").mockReturnValueOnce(
            Promise.resolve([])
        );
        const result = await query.execute({ userId: USER_ID });
        expect(result.ok).toBeTruthy();
        expect(result.unwrap().groups).toEqual([]);
    });
	it("group data doesn't found", async () => {
        vi.spyOn(nishikiDynamoDBClient, "listOfUsersGroup").mockReturnValueOnce(
			Promise.resolve([
				{ PK: "1", SK: "1", groupId: "1" },
			]),
		);
        vi.spyOn(nishikiDynamoDBClient, "getGroup").mockReturnValueOnce(Promise.resolve(null));

        const result = await query.execute({ userId: USER_ID});
        expect(result.ok).toBeTruthy();
        expect(result.unwrap().groups).toEqual([]);
    });
	it("invalid UUID", async () => {
        const result = await query.execute({userId: "invalid"});
        expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).toBeInstanceOf(InvalidUUID)
    });
});
