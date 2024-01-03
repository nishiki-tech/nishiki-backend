import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";
import { hasError } from "result-ts-type";
import { ContainerId } from "../Domain/Entities/Container";
import { GroupName } from "../Domain/ValueObjects/GroupName";
import { UserId } from "src/User";

interface GroupWithRelationsPrimitiveData {
	groupId: string;
	groupName: string;
	userIds: string[];
	containerIds: string[];
}
/**
 * Group repository.
 * The Group item's definition is described in the following document.
 * @link https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#Group
 */
export class GroupRepository implements IGroupRepository {
	private readonly nishikiDbClient: NishikiDynamoDBClient;

	/**
	 * If the client is not specified, the default client is used.
	 * @param nishikiDbClient
	 * @throws the data in the repository is invalid.
	 */
	constructor(nishikiDbClient?: NishikiDynamoDBClient) {
		this.nishikiDbClient = nishikiDbClient
			? nishikiDbClient
			: new NishikiDynamoDBClient();
	}

	async find(id: GroupId): Promise<Group | null>;
	async find(id: ContainerId): Promise<Group | null>;
	async find(id: GroupId | ContainerId): Promise<Group | null> {
		const groupDetailData =
			id instanceof GroupId
				? await this.nishikiDbClient.getGroup({
						groupId: id.id,
				  })
				: await this.nishikiDbClient.getGroup({
						containerId: id.id,
				  });

		if (!groupDetailData) return null;

		const groupId = groupDetailData.groupId;

		const [listOfContainers, listOfUsersInGroup] = await Promise.all([
			this.nishikiDbClient.listOfContainers(groupId),
			this.nishikiDbClient.listOfUsersInGroup(groupId),
		]);

		return createGroupObject({
			groupId: groupId,
			groupName: groupDetailData.groupName,
			userIds: listOfUsersInGroup.map((user) => user.userId),
			containerIds: listOfContainers,
		});
	}

	/**
	 *
	 * Create a Group.
	 * @param Group
	 */
	async create(Group: Group): Promise<undefined> {
		await this.nishikiDbClient.saveGroup(Group.id.id, {
			groupName: Group.name,
			userIds: Group.userIds.map((userId) => userId.id),
			containerIds: Group.containerIds.map((containerId) => containerId.id),
		});
	}

	/**
	 * Update a Group
	 * @param Group
	 */
	async update(Group: Group): Promise<undefined> {
		await this.nishikiDbClient.saveGroup(Group.id.id, {
			groupName: Group.name,
			userIds: Group.userIds.map((userId) => userId.id),
			containerIds: Group.containerIds.map((containerId) => containerId.id),
		});
	}

	/**
	 * Delete a Group
	 * @param id - target Group id
	 */
	async delete(id: GroupId): Promise<undefined> {
		// TODO: delete all containers and users in the group.
	}
}

/**
 * Create a Group from primitive values.
 * When groupData is invalid, this function throws an error.
 * @param groupData
 * @throws GroupRepositoryError - this error will be thrown when the data is invalid.
 */
const createGroupObject = (
	groupData: GroupWithRelationsPrimitiveData,
): Group => {
	const groupIdOrErr = GroupId.create(groupData.groupId);
	const groupnameOrErr = GroupName.create(groupData.groupName);

	const errorResult = hasError([groupIdOrErr, groupnameOrErr]);
	if (errorResult.err) {
		const report = `GroupId: ${groupData.groupId}, errorResult.error.message`;
		throw new GroupRepositoryError(errorResult.error.message, report);
	}
	const groupId = groupIdOrErr.unwrap();
	const name = groupnameOrErr.unwrap();

	const groupOrError = Group.create(groupId, {
		name: name.name,
		userIds: groupData.userIds.map((userId) => {
			const userIdOrError = UserId.create(userId);
			if (userIdOrError.ok) return userIdOrError.unwrap();
			const report = `UserId: ${userId}, ${userIdOrError.error.message}`;
			throw new GroupRepositoryError(userIdOrError.error.message, report);
		}),
		containerIds: groupData.containerIds.map((containerId) => {
			const containerIdOrError = ContainerId.create(containerId);
			if (containerIdOrError.ok) return containerIdOrError.unwrap();
			const report = `ContainerId: ${containerId}, ${containerIdOrError.error.message}`;
			throw new GroupRepositoryError(containerIdOrError.error.message, report);
		}),
	});

	if (!groupOrError.ok) {
		const report = `GroupId: ${groupId}, ${groupOrError.error.message}`;
		throw new GroupRepositoryError(groupOrError.error.message, report);
	}

	return groupOrError.unwrap();
};

class GroupRepositoryError extends RepositoryError {
	constructor(message: string, report: string | string[]) {
		super("GroupRepositoryError", message, report);
	}
}
