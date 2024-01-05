import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserId } from "src/User";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import {
	FindUserQuery,
	InvalidID,
} from "src/User/Query/FindUser/FindUserQuery";
import { testDynamoDBClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { UserData } from "src/Shared/Adapters/DB/NishikiDBTypes";

const DUMMY_USER_ID = UserId.generate().id;

const DUMMY_USER_DATA: UserData = {
	userId: DUMMY_USER_ID,
	username: "username",
	emailAddress: "hoge@nishiki.co.jp",
};

describe("find user query", () => {
	let nishikiDynamoDb: NishikiDynamoDBClient;
	let findUserQuery: FindUserQuery;
	const tableName = "find-user-query-table";
	const client = testDynamoDBClient(tableName);

	beforeEach(() => {
		nishikiDynamoDb = new NishikiDynamoDBClient(client, tableName);
		findUserQuery = new FindUserQuery(nishikiDynamoDb);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Normal System", () => {
		it("get a single user", async () => {
			vi.spyOn(nishikiDynamoDb, "getUser").mockReturnValueOnce(
				// @ts-ignore
				Promise.resolve(DUMMY_USER_DATA),
			);
			const result = await findUserQuery.execute(DUMMY_USER_ID);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap()).toEqual(DUMMY_USER_DATA);
		});

		it("get a list of users", async () => {
			vi.spyOn(nishikiDynamoDb, "getUser").mockReturnValueOnce(
				// @ts-ignore
				Promise.resolve(null),
			);
			vi.spyOn(nishikiDynamoDb, "getUser").mockReturnValueOnce(
				// @ts-ignore
				Promise.resolve(DUMMY_USER_DATA),
			);
			const result = await findUserQuery.execute([
				DUMMY_USER_ID,
				UserId.generate().id,
			]);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap()).toEqual([DUMMY_USER_DATA]);
		});

		it("get a list of users. when some values are null, returns data without null", async () => {
			vi.spyOn(nishikiDynamoDb, "getUser").mockReturnValueOnce(
				// @ts-ignore
				Promise.resolve(DUMMY_USER_DATA),
			);
			const result = await findUserQuery.execute([DUMMY_USER_ID]);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap()).toEqual([DUMMY_USER_DATA]);
		});

		it("If the user is not found", async () => {
			vi.spyOn(nishikiDynamoDb, "getUser").mockReturnValueOnce(
				// @ts-ignore
				Promise.resolve(null),
			);
			const result = await findUserQuery.execute(DUMMY_USER_ID);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap()).toBeNull();
		});

		it("if an empty array is provided", async () => {
			const result = await findUserQuery.execute([]);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap()).toEqual([]);
		});
	});

	describe("Abnormal System", () => {
		it("invalid ID", async () => {
			const invalidId = "invalid-id";
			const result = await findUserQuery.execute(invalidId);
			expect(result.ok).toBeFalsy();
			expect(result.unwrapError()).toBeInstanceOf(InvalidID);
		});

		it("list contains an invalid ID", async () => {
			const result = await findUserQuery.execute([DUMMY_USER_ID, "invalid-id"]);
			expect(result.ok).toBeFalsy();
			expect(result.unwrapError()).toBeInstanceOf(InvalidID);
		});

		it("", async () => {});
	});
});
