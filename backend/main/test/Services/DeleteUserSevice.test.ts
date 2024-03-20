import { afterEach, beforeEach, describe, vi, it, expect } from "vitest";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { testDynamoDBClient } from "test/Shared/Adapters/DynamoDBTestClient";
import { MockGroupRepository } from "test/Group/MockGroupRepository";
import { MockUserRepository } from "test/User/MockUserRepository";
import { FindGroupsInformationQuery } from "src/Group/Query/FindGroupsInformation/FindGroupsInformatoinQuery";
import { DeleteUserService } from "src/Services/DeleteUserService/DeleteUserService";

describe("Delete a user service", () => {
	const TABLE_NAME = "delete-a-user-service";
	const testNishikiDynamoDBClient = testDynamoDBClient(TABLE_NAME);
	const groupRepository = new MockGroupRepository();
	const userRepository = new MockUserRepository();

	let service: DeleteUserService;

	beforeEach(() => {
		const query = new FindGroupsInformationQuery(
			new NishikiDynamoDBClient(testNishikiDynamoDBClient),
		);
		service = new DeleteUserService(groupRepository, userRepository, query);
	});
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Abnormal system", () => {
		it("the user IDs must be much", async () => {
			const result = await service.execute({
				targetUserId: "target",
				userId: "id",
			});

			expect(result.statusCode).toBe(403);
		});

		it("user ID must be correct UUID4", async () => {
			const userId = "incorrect User ID";

			const result = await service.execute({
				targetUserId: userId,
				userId: userId,
			});

			expect(result.statusCode).toBe(400);
		});
	});
});
