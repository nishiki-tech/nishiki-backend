import {
	DeleteItemCommand,
	DynamoDBClient,
	GetItemInput,
	GetItemCommand,
	PutItemCommand,
	QueryInput,
	QueryCommand,
	DeleteItemInput,
	PutItemInput,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { TABLE_NAME } from "src/Settings/Setting";
import { UserData } from "src/Shared/Adapters/DB/NishikiDBTypes";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";

/**
 * EMailUserRelation
 * https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#emailuserrelation
 */
const EMAIL_ADDRESS_RELATION_INDEX_NAME = "EMailAndUserIdRelationship";

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
