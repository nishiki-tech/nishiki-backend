import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FindContainerQuery } from "src/Group/Query/FindContainer/FindContanerQuery";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { UserId } from "src/User";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { UserIsNotAuthorized } from "src/Group/Query/FindContainer/IFindContainerUseCase";
import { containerWithGroupDtoMapper } from "src/Group/Dtos/ContainerWithGroupDto";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";

const USER_ID = UserId.generate();
const GROUP_ID = "4898aa6e-ef03-4ae2-86c4-1db39b25a0bc";
const GROUP_NAME = "group name";
const CONTAINER_ID = "6112947e-e2bf-4a68-b3e5-9c39a937a297";
const CONTAINER_NAME = "container name";

describe("find container use case", () => {
	let mockNishikiDynamoClient: NishikiDynamoDBClient;
	let useCase: FindContainerQuery;

	const containerId = ContainerId.create("dummyId").unwrap();
	const container: Container = Container.default(containerId).unwrap();

	const groupId = GroupId.create("dummyGroupId").unwrap();
	const groupName = "dummyGroupName";

	beforeEach(() => {
		mockNishikiDynamoClient = new NishikiDynamoDBClient();
		useCase = new FindContainerQuery(mockNishikiDynamoClient);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("Find exiting container", async () => {
		vi.spyOn(mockNishikiDynamoClient, "getGroup").mockReturnValueOnce(
			Promise.resolve({ groupId: GROUP_ID, groupName: GROUP_NAME }),
		);

		vi.spyOn(mockNishikiDynamoClient, "getUser").mockReturnValueOnce(
			Promise.resolve(true),
		);

		vi.spyOn(mockNishikiDynamoClient, "getContainer").mockReturnValueOnce(
			Promise.resolve({
				containerId: CONTAINER_ID,
				containerName: CONTAINER_NAME,
				foods: [],
			}),
		);

		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: CONTAINER_ID,
		});
		expect(result.ok).toBeTruthy();

		const returnData = result.unwrap();
		expect(returnData?.group.groupId).toBe(GROUP_ID);
		expect(returnData?.group.groupName).toBe(GROUP_NAME);
		expect(returnData?.id).toBe(CONTAINER_ID);
		expect(returnData?.name).toBe(CONTAINER_NAME);
	});

	it("Container not found", async () => {
		const group = Group.create(groupId, {
			name: groupName,
			containerIds: [],
			userIds: [USER_ID],
		}).unwrap();

		vi.spyOn(mockNishikiDynamoClient, "getGroup").mockReturnValueOnce(
			Promise.resolve({ groupId: GROUP_ID, groupName: GROUP_NAME }),
		);

		vi.spyOn(mockNishikiDynamoClient, "getUser").mockReturnValueOnce(
			Promise.resolve(true),
		);

		vi.spyOn(mockNishikiDynamoClient, "getContainer").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: CONTAINER_ID,
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toBeNull();
	});

	it("Group not found", async () => {
		vi.spyOn(mockNishikiDynamoClient, "getGroup").mockReturnValueOnce(
			Promise.resolve(null),
		);

		vi.spyOn(mockNishikiDynamoClient, "getUser").mockReturnValueOnce(
			Promise.resolve(true),
		);

		vi.spyOn(mockNishikiDynamoClient, "getContainer").mockReturnValueOnce(
			Promise.resolve(null),
		);

		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: CONTAINER_ID,
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap()).toBeNull();
	});

	it("User is not authorized", async () => {
		vi.spyOn(mockNishikiDynamoClient, "getGroup").mockReturnValueOnce(
			Promise.resolve({ groupId: GROUP_ID, groupName: GROUP_NAME }),
		);

		vi.spyOn(mockNishikiDynamoClient, "getUser").mockReturnValueOnce(
			Promise.resolve(false),
		);

		vi.spyOn(mockNishikiDynamoClient, "getContainer").mockReturnValueOnce(
			Promise.resolve({
				containerId: CONTAINER_ID,
				containerName: CONTAINER_NAME,
				foods: [],
			}),
		);

		const result = await useCase.execute({
			userId: USER_ID.id,
			containerId: CONTAINER_ID,
		});

		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
	});
});
