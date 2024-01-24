import { describe, expect, it, vi } from "vitest";
import { GetUserService } from "src/Services/GetUserIdService/GetUserService";
import jwt from "jsonwebtoken";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { ServiceError } from "src/Shared/Utils/Errors";

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

	it("header is undefined", async () => {
		const service = new GetUserService(mockNishikiDynamoDBClient);
		vi.spyOn(mockNishikiDynamoDBClient, "getUserIdByEmail").mockReturnValueOnce(
			Promise.resolve("dummyUserId"),
		);
		const userIdOrError = (await service.getUserId(undefined)).unwrapError();

		expect(mockNishikiDynamoDBClient.getUserIdByEmail).not.toBeCalled();
		expect(userIdOrError).toBeInstanceOf(ServiceError);
	});

	it("token is invalid", async () => {
		const service = new GetUserService(mockNishikiDynamoDBClient);
		vi.spyOn(mockNishikiDynamoDBClient, "getUserIdByEmail").mockReturnValueOnce(
			Promise.resolve("dummyUserId"),
		);
		const userIdOrError = (
			await service.getUserId("invalidToken")
		).unwrapError();

		expect(mockNishikiDynamoDBClient.getUserIdByEmail).not.toBeCalled();
		expect(userIdOrError).toBeInstanceOf(ServiceError);
	});

	it("user not found", async () => {
		const service = new GetUserService(mockNishikiDynamoDBClient);
		vi.spyOn(mockNishikiDynamoDBClient, "getUserIdByEmail").mockReturnValueOnce(
			Promise.resolve(null),
		);
		const userIdOrError = (
			await service.getUserId(testAuthHeader)
		).unwrapError();

		expect(mockNishikiDynamoDBClient.getUserIdByEmail).toBeCalledWith(
			"dummyEmailAddress",
		);
		expect(userIdOrError).toBeInstanceOf(ServiceError);
	});
});
