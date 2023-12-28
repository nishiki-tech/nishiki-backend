import {
	DeleteItemInput,
	DeleteItemCommand,
	DynamoDBClient,
	GetItemInput,
	GetItemCommand,
	PutItemInput,
	PutItemCommand,
	QueryInput,
	QueryCommand,
	AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { TABLE_NAME } from "src/Settings/Setting";
import {
	GroupData,
	UserData,
	GroupInput,
	UserGroupRelation,
	InvitationLink,
	ContainerData,
	FoodItem,
	fromFoodItemToFood,
	fromFoodToFoodItem,
} from "src/Shared/Adapters/DB/NishikiDBTypes";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";

/**
 * EMailUserRelation
 * https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#emailuserrelation
 */
const EMAIL_ADDRESS_RELATION_INDEX_NAME = "EMailAndUserIdRelationship";

/**
 * UserAndGroupRelations
 * https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#userandgrouprelations
 */
const USER_AND_GROUP_RELATIONS = "UserAndGroupRelationship";

/**
 * InvitationHash
 * https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#invitationhash
 */
const INVITATION_HASH = "InvitationHash";

/**
 * GroupAndContainerRelationship
 * https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#groupandcontainerrelationship
 */
const GROUP_AND_CONTAINER_RELATIONSHIP = "GroupAndContainerRelationship";

/**
 * This class is wrapper of the AWS DynamoDB client.
 * To use DynamoDB, we need to define the access patterns while designing the table.
 * This client is the concrete class of the access patterns against the NishikiTable, which is the DB of this application.
 *
 * [Nishiki DB definition](https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database)
 *
 * @class NishikiDynamoDBClient
 */
export class NishikiDynamoDBClient {
	readonly dynamoClient: DynamoDBClient;
	readonly tableName: string;

	/**
	 * The params are for debugging.
	 * In production, you don't need to set the params.
	 *
	 * @constructor
	 * @param dbClient - the DynamoDB client of the AWS SDK.
	 * @param tableName - the name of the target table.
	 */
	constructor(
		dbClient: DynamoDBClient = dynamoClient,
		tableName: string = TABLE_NAME,
	) {
		this.dynamoClient = dbClient;
		this.tableName = tableName;
	}

	/**
	 * Get a single user from the DB.
	 * @returns {UserData | null} - the user data. If the user does not exist, it returns null.
	 * @param argument
	 */
	async getUser(argument: IGetUserByUserID): Promise<UserData | null>;
	/**
	 * Check an existence of the user.
	 * @param argument { IGetUserByUserIDAndGroupID }
	 */
	async getUser(argument: IGetUserByUserIDAndGroupID): Promise<boolean>;
	async getUser(
		argument: IGetUserByUserID | IGetUserByUserIDAndGroupID,
	): Promise<UserData | null | boolean> {
		if ("groupId" in argument && argument.groupId) {
			const getUserInput: GetItemInput = {
				TableName: this.tableName,
				Key: marshall({
					PK: argument.userId,
					SK: `Group#${argument.groupId}`,
				}),
			};

			const command = new GetItemCommand(getUserInput);
			const response = await this.dynamoClient.send(command);

			return !!response.Item;
		}

		const getUserInput: GetItemInput = {
			TableName: this.tableName,
			Key: marshall({
				PK: argument.userId,
				SK: "User",
			}),
		};

		const getUserCommand = new GetItemCommand(getUserInput);

		const response = await this.dynamoClient.send(getUserCommand);

		if (!response.Item) return null;

		const userResponse = unmarshall(response.Item);

		return {
			userId: userResponse.PK,
			username: userResponse.UserName,
			emailAddress: userResponse.EMailAddress,
		};
	}

	/**
	 * Get a list of user IDs who belong to the group from the DB.
	 * @param groupId
	 */
	async listOfUsersInGroup(groupId: string): Promise<UserGroupRelation[]> {
		const listOfUsersInGroupInput: QueryInput = {
			TableName: this.tableName,
			IndexName: USER_AND_GROUP_RELATIONS,
			KeyConditionExpression: "GroupId = :groupId",
			ExpressionAttributeValues: marshall({
				":groupId": groupId,
			}),
		};

		const command = new QueryCommand(listOfUsersInGroupInput);
		const response = await this.dynamoClient.send(command);

		if (!response.Items) return [];
		if (response.Items.length === 0) return [];

		return response.Items.map((item) => {
			const unmarshalledItem = unmarshall(item);

			return {
				userId: unmarshalledItem.PK,
				SK: unmarshalledItem.SK,
			};
		});
	}

	/**
	 * Save a user to the DB.
	 * @param user - user data
	 */
	async saveUser(user: UserData) {
		const saveUserInput: PutItemInput = {
			TableName: this.tableName,
			Item: marshall({
				PK: user.userId,
				SK: "User",
				UserName: user.username,
				EMailAddress: user.emailAddress,
			}),
		};

		const command = new PutItemCommand(saveUserInput);
		await this.dynamoClient.send(command);
	}

	async deleteUser(userId: string) {
		const deleteUserInput: DeleteItemInput = {
			TableName: this.tableName,
			Key: marshall({
				PK: userId,
				SK: "User",
			}),
		};

		const command = new DeleteItemCommand(deleteUserInput);
		await this.dynamoClient.send(command);
	}

	/**
	 * Get a group from the DB.
	 * @param groupId
	 * @returns {GroupData | null} - the group data. If the group does not exist, it returns null.
	 */
	async getGroup(groupId: { groupId: string }): Promise<GroupData | null>;
	/**
	 * get a group by the container ID.
	 * @param containerId
	 * @returns {GroupData | null} - the group data. If the group does not exist, it returns null.
	 * @throws {NishikiTableClientError} - if the container has more than one group.
	 */
	async getGroup(containerId: {
		containerId: string;
	}): Promise<GroupData | null>;
	async getGroup(
		id: { groupId: string } | { containerId: string },
	): Promise<GroupData | null> {
		// when the argument is the groupId.
		if ("groupId" in id && id.groupId) {
			const groupId = id.groupId;

			const getGroupInput: GetItemInput = {
				TableName: this.tableName,
				Key: marshall({
					PK: groupId,
					SK: "Group",
				}),
			};

			const command = new GetItemCommand(getGroupInput);
			const response = await this.dynamoClient.send(command);

			if (!response.Item) return null;

			const unmarshalledData = unmarshall(response.Item);

			return {
				groupId: unmarshalledData.PK,
				groupName: unmarshalledData.GroupName,
			};
		} else if ("containerId" in id && id.containerId) {

			const containerId = id.containerId;

			const queryGroupInput: QueryInput = {
				TableName: this.tableName,
				IndexName: GROUP_AND_CONTAINER_RELATIONSHIP,
				KeyConditionExpression: "ContainerId = :containerId",
				ExpressionAttributeValues: marshall({
					":containerId": containerId,
				}),
			};

			const command = new QueryCommand(queryGroupInput);
			const response = await this.dynamoClient.send(command);

			if (!(response.Items && response.Items.length > 0)) return null;

			console.log(response.Items);

			if (response.Items.length > 1) {

				let containerIds: string[] = response.Items.map(item => `ContainerId: ${unmarshall(item).ContainerId}`);

				throw new NishikiTableClientError(
					"There are more than one groups in the container.",
					containerIds
				);
			}

			const result = unmarshall(response.Items[0]);

			return this.getGroup({groupId: result.PK});
		} else {
			throw new NishikiTableClientError(
				"Invalid argument is provided",
				String(id)
			)
		}
	}

	/**
	 * Save a group to the DB.
	 * This function generates multiple putItem commands and sends it concurrently.
	 * If user IDs are provided, this function issues [PutItem commands for creating user and group relations](https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#user).
	 * @param groupId
	 * @param props
	 */
	async saveGroup(groupId: string, props: GroupInput) {
		const { groupName, userIds, containerIds } = props;

		// no change
		if (!(groupName || userIds || containerIds)) {
			return;
		}

		let putCommands: PutItemCommand[] = [];

		// save a group with name
		if (groupName) {
			putCommands.push(
				new PutItemCommand({
					TableName: this.tableName,
					Item: marshall({
						PK: groupId,
						SK: "Group",
						GroupName: groupName,
					}),
				}),
			);
		}

		// crate put-user-item commands
		if (userIds && userIds.length > 0) {
			const userAndGroupPutCommands: PutItemCommand[] = userIds.map(
				(userId) => {
					return new PutItemCommand({
						TableName: this.tableName,
						Item: marshall({
							PK: userId,
							SK: `Group#${groupId}`,
							GroupId: groupId,
						}),
					});
				},
			);

			putCommands = [...putCommands, ...userAndGroupPutCommands];
		}

		// crate put-container-item commands
		if (containerIds && containerIds.length > 0) {
			const containerPutCommands: PutItemCommand[] = containerIds.map(
				(containerId) => {
					return new PutItemCommand({
						TableName: this.tableName,
						Item: marshall({
							PK: groupId,
							SK: `Container#${containerId}`,
							ContainerId: containerId,
						}),
					});
				},
			);

			putCommands = [...putCommands, ...containerPutCommands];
		}

		await Promise.all(
			putCommands.map((command) => this.dynamoClient.send(command)),
		);
	}

	/**
	 * Add a link and hash data to the Table.
	 * This function takes the link expiry Datetime as a parameter.
	 * @param groupId - UUID of the group ID
	 * @param linkExpiryDatetime - Accepting a Data object. Which is stored as the ISO string.
	 * @param invitationLinkHash - hash data
	 */
	async addInvitationLink(
		groupId: string,
		linkExpiryDatetime: Date,
		invitationLinkHash: string,
	) {
		const putJoinLinkInput: PutItemInput = {
			TableName: this.tableName,
			Item: marshall({
				PK: groupId,
				SK: "InvitationLinkHash",
				LinkExpiryDatetime: linkExpiryDatetime.toISOString(),
				InvitationLinkHash: invitationLinkHash,
			}),
		};

		const command = new PutItemCommand(putJoinLinkInput);
		await this.dynamoClient.send(command);
	}

	/**
	 * Get an invitation link.
	 * If Group ID is set as an argument, this function gets an invitation link using default PK and SK.
	 * If Invitation Link Hash is set as an argument, this function gets an invitation link using the InvitationHash GSI.
	 * When the invitation link hash is provided the operation against DB will be the query.
	 * Which means we cannot deny the possibility that there are multiple invitation link hash.
	 * In that case, this function returns the latest Datetime one.
	 * And, for the debugging sake, log the duplicate hash values.
	 * @param id - this value can be both the Group ID and the Invitation Link Hash
	 * @returns {InvitationLink | null}
	 */
	async getInvitationLink(id: string): Promise<InvitationLink | null> {
		// the group ID should be the uuid.
		// this block is for the Group ID.
		if (isValidUUIDV4(id)) {
			const getItemInput: GetItemInput = {
				TableName: this.tableName,
				Key: marshall({
					PK: id,
					SK: "InvitationLinkHash",
				}),
			};

			const command = new GetItemCommand(getItemInput);
			const response = await this.dynamoClient.send(command);

			if (!response.Item) return null;

			return fromItemToInvitationLink(response.Item);
		}

		// When the ID in the argument is the Invitation Link Hash.
		const queryItemInput: QueryInput = {
			TableName: this.tableName,
			IndexName: INVITATION_HASH,
			KeyConditionExpression: "InvitationLinkHash = :invitationLinkHash",
			ExpressionAttributeValues: marshall({
				":invitationLinkHash": id,
			}),
		};

		const command = new QueryCommand(queryItemInput);
		const response = await this.dynamoClient.send(command);

		if (!(response.Items && response.Items.length > 0)) return null;

		return fromItemToInvitationLink(response.Items[0]);
	}

	/**
	 * delete an invitation link
	 * @param groupId
	 */
	async deleteInvitationLink(groupId: string): Promise<void>;
	/**
	 * delete group using the InvitationLink type alias
	 * @param invitationLink
	 */
	async deleteInvitationLink(invitationLink: InvitationLink): Promise<void>;
	async deleteInvitationLink(argument: InvitationLink | string): Promise<void> {
		let groupId = "";

		if (typeof argument === "string") {
			if (!isValidUUIDV4(argument)) {
				throw new NishikiTableClientError("Invalid Input", [
					"Detect an invalid input in the deleteInvitationLink input.",
					"This must be a mistake of programmer.",
					`Argument: ${argument}`,
				]);
			}
			groupId = argument;
		} else {
			groupId = argument.groupId;
		}

		const deleteInvitationLinkInput: DeleteItemInput = {
			TableName: this.tableName,
			Key: marshall({
				PK: groupId,
				SK: "InvitationLinkHash",
			}),
		};

		const command = new DeleteItemCommand(deleteInvitationLinkInput);
		await this.dynamoClient.send(command);
	}
	/**
	 * delete group by the groupId.
	 * @param groupId
	 */
	async deleteGroup(groupId: string) {
		const deleteGroupInput: DeleteItemInput = {
			TableName: this.tableName,
			Key: marshall({
				PK: groupId,
				SK: "Group",
			}),
		};

		const command = new DeleteItemCommand(deleteGroupInput);
		await this.dynamoClient.send(command);
	}

	/**
	 * save a container to the DB.
	 * @param container
	 */
	async saveContainer(container: ContainerData): Promise<void> {
		const foods: FoodItem[] = container.foods.map((food) =>
			fromFoodToFoodItem(food),
		);

		const saveContainerInput: PutItemInput = {
			TableName: this.tableName,
			Item: marshall({
				PK: container.containerId,
				SK: "Container",
				ContainerName: container.containerName,
				Foods: foods,
			}),
		};

		const command = new PutItemCommand(saveContainerInput);
		await this.dynamoClient.send(command);
	}

	/**
	 * get a container from the DB.
	 * @param containerId
	 */
	async getContainer(containerId: string): Promise<ContainerData | null> {
		const getContainerInput: GetItemInput = {
			TableName: this.tableName,
			Key: marshall({
				PK: containerId,
				SK: "Container",
			}),
		};

		const command = new GetItemCommand(getContainerInput);
		const response = await this.dynamoClient.send(command);

		if (!response.Item) return null;

		const item = unmarshall(response.Item);

		return {
			containerId: item.PK,
			containerName: item.ContainerName,
			foods: (item.Foods as FoodItem[]).map((food) => fromFoodItemToFood(food)),
		};
	}

	/**
	 * Returns a list of container IDs.
	 * The container IDs are narrowed down by the group ID.
	 * @param groupId
	 * @returns string[] - a list of container IDs.
	 */
	async listOfContainers(groupId: string): Promise<string[]> {
		const listOfContainersInput: QueryInput = {
			TableName: this.tableName,
			KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
			ExpressionAttributeValues: marshall({
				":pk": groupId,
				":sk": "Container#",
			}),
		};

		const command = new QueryCommand(listOfContainersInput);
		const result = await this.dynamoClient.send(command);

		if (!(result.Items && result.Items.length > 0)) return [];

		return result.Items.map((item) => unmarshall(item).ContainerId);
	}

	/**
	 * Get a user ID by the user's email address.
	 * @param emailAddress - the user's email address.
	 * @returns {string | null} - the user ID. If the user does not exist, it returns null.
	 */
	async getUserIdByEmail(emailAddress: string): Promise<string | null> {
		const getUserInput: QueryInput = {
			TableName: this.tableName,
			IndexName: EMAIL_ADDRESS_RELATION_INDEX_NAME,
			KeyConditionExpression: "EMailAddress = :email",
			ExpressionAttributeValues: marshall({
				":email": emailAddress,
			}),
		};
		const command = new QueryCommand(getUserInput);
		const response = await this.dynamoClient.send(command);

		if (!response.Items) return null;

		if (response.Items.length === 0) return null;

		if (response.Items.length > 1) {
			const report = [
				...response.Items.map((item) => `UserID: ${unmarshall(item).PK}`),
			];
			throw new NishikiTableClientError(
				"Multiple users are found with the same email address.",
				report,
			);
		}

		return unmarshall(response.Items[0]).PK;
	}

	/**
	 * This is just the factory method of the NishikiDynamoDBClient.
	 * Used for the shorthand.
	 *
	 * @returns {NishikiDynamoDBClient} - the instance of the NishikiDynamoDBClient.
	 *
	 * @example
	 * ```ts
	 * /// using this, you can write a code with one line.
	 * const data = NishikiDynamoDBClient.use().getOperation();
	 * ```
	 */
	static use(): NishikiDynamoDBClient {
		return new NishikiDynamoDBClient();
	}
}

class NishikiTableClientError extends RepositoryError {
	constructor(message: string, report: string | string[]) {
		super("NishikiTableClientError", message, report);
	}
}

/**
 * This function takes the item of the invitation link and returns InvitationLink.
 * Helper function for the InvitationLink function.
 * @param item
 * @returns {InvitationLink}
 */
const fromItemToInvitationLink = (
	item: Record<string, AttributeValue>,
): InvitationLink => {
	const unmarshalled = unmarshall(item);

	return {
		groupId: unmarshalled.PK,
		SK: unmarshalled.SK,
		linkExpiryTime: new Date(unmarshalled.LinkExpiryDatetime),
		invitationLinkHash: unmarshalled.InvitationLinkHash,
	};
};

// for debug
export const __local__ = {
	EMAIL_ADDRESS_RELATION_INDEX_NAME,
	USER_AND_GROUP_RELATIONS,
	INVITATION_HASH,
	GROUP_AND_CONTAINER_RELATIONSHIP,
};

interface IGetUserByUserID {
	userId: string;
}

interface IGetUserByUserIDAndGroupID {
	userId: string;
	groupId: string;
}