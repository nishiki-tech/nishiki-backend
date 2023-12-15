import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { MockContainerRepository } from "../MockContainerRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { UserId } from "src/User/Domain/Entity/User";
import { MockGroupRepository } from "../MockGroupRepository";
import { UserIsNotAuthorized } from "src/Group/UseCases/CreateContainerUseCase/ICreateContainerUseCase";

const USER_ID = UserId.generate().id;

describe("create container use case", () => {
	let mockContainerRepository: MockContainerRepository;
	let mockGroupRepository: MockGroupRepository;
	let useCase: CreateContainerUseCase;
	const userId = UserId.create(USER_ID).unwrap();

	const groupId = GroupId.create("dummyGroupId").unwrap();
	const groupName = "dummyGroupName";
	const group = Group.create(groupId, {
		name: groupName,
		containerIds: [],
		userIds: [userId],
	}).unwrap();
	beforeEach(() => {
		mockContainerRepository = new MockContainerRepository();
		mockGroupRepository = new MockGroupRepository();
		useCase = new CreateContainerUseCase(
			mockContainerRepository,
			mockGroupRepository,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("create container", async () => {
		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);

		const result = await useCase.execute({
			groupId: groupId.id,
			userId: userId.id,
		});
		console.log(result);
		expect(result.ok).toBeTruthy();
	});
	it("create container with name", async () => {
		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);

		const result = await useCase.execute({
			groupId: groupId.id,
			userId: userId.id,
			name: "dummy-name",
		});
		expect(result.ok).toBeTruthy();
		expect(result.unwrap().name).toBe("dummy-name");
	});
	it("create container by invalid user", async () => {
		const USER_ID_2 = UserId.generate().id;
		const userId_2 = UserId.create(USER_ID_2).unwrap();

		// when the container is not registered yet.
		vi.spyOn(mockContainerRepository, "find").mockReturnValueOnce(
			Promise.resolve(null),
		);
		vi.spyOn(mockGroupRepository, "find").mockReturnValueOnce(
			Promise.resolve(group),
		);

		const result = await useCase.execute({
			groupId: groupId.id,
			userId: userId_2.id,
		});
		expect(result.ok).toBeFalsy();
		expect(result.unwrapError()).instanceOf(UserIsNotAuthorized);
	});
});
