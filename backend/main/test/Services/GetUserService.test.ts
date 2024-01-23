import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetUserService } from "src/Services/GetUserIdService/GetUserService";
import jwt from "jsonwebtoken";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";

const mockBearerToken = (userId = "mockUserId") => {
	const payload = {
		sub: userId,
		exp: Math.floor(Date.now() / 1000) + 3600,
	};

	const token = jwt.sign(payload, "dummy-secret-key");

	return `Bearer ${token}`;
};

describe("Get UserId From header", () => {
	const mockNishikiDynamoDBClient = new NishikiDynamoDBClient();
	const testAuthHeader = mockBearerToken("dummyEmailAddress");

	it("get userId from header", async () => {
		const service = new GetUserService(mockNishikiDynamoDBClient);
		vi.spyOn(mockNishikiDynamoDBClient, "getUserIdByEmail").mockReturnValueOnce(
			Promise.resolve("dummyUserId"),
		);
		const userId = (await service.getUserId(testAuthHeader)).unwrap();

		expect(mockNishikiDynamoDBClient.getUserIdByEmail).toBeCalledWith(
			"dummyEmailAddress",
		);
		expect(userId).toBe("dummyUserId");
	});
});
