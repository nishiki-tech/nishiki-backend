import {
	DeleteItemCommand,
	DynamoDBClient,
	GetItemInput,
	GetItemCommand,
	PutItemCommand,
	DeleteItemInput,
	PutItemInput,
	QueryInput,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { TABLE_NAME } from "src/Settings/Setting";
import {
	GroupData,
	UserData,
	GroupInput,
	UserGroupRelation,
} from "src/Shared/Adapters/DB/NishikiDBTypes";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";

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
	 * @param userId - user's ID. It should be UUID.
	 * @returns {UserData | null} - the user data. If the user does not exist, it returns null.
	 */
	async getUser(userId: string): Promise<UserData | null> {
		const getUserInput: GetItemInput = {
			TableName: this.tableName,
			Key: marshall({
				PK: userId,
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
	async getGroup(groupId: string): Promise<GroupData | null> {
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
	}

	/**
	 * Save a group to the DB.
	 * This function generates multiple putItem commands and sends it concurrently.
	 * If user IDs are provided, this function issues [PutItem commands for creating user and group relations](https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#user).
	 * @param groupId
	 * @param props
	 */
	async saveGroup(groupId: string, props: GroupInput) {
		const { groupName, userIds, containers } = props;

		// no change
		if (!(groupName || userIds || containers)) {
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
		if (containers && containers.length > 0) {
			const containerPutCommands: PutItemCommand[] = containers.map(
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
	 * delete group
	 * @param groupId
	 */
	async deleteGroup(groupId: string) {
		// TODO: need to add a deleting user that belongs to this group logic
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
