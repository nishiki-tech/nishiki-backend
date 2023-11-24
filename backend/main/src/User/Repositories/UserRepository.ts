import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User/Domain/Entity/User";
import {dynamoClient} from "src/Shared/Adapters/DynamoClient";
import {GetItemInput} from "@aws-sdk/client-dynamodb/dist-types/models";
import {TABLE_NAME} from "src/Settings/Setting";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {GetItemCommand, PutItemCommand, PutItemCommandInput} from "@aws-sdk/client-dynamodb/dist-types/commands";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

/**
 * User repository.
 * The user item's definition is described in the following document.
 * @link https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#user
 */
class UserRepository implements IUserRepository {

	private readonly dynamoClient: DynamoDBClient;

	/**
	 * If the client is not specified, the default client is used.
	 * @param client - this is for the debugging.
	 */
	constructor(client?: DynamoDBClient) {
		this.dynamoClient = client || dynamoClient
	}

	async find(id: UserId): Promise<User | null>;
	async find(id: UserId[]): Promise<User[]>;
	async find(id: UserId | UserId[]): Promise<User | User[] | null> {
		// if the ID is array.
		if (Array.isArray(id)) {
			const users = await Promise.all(id.map(userId => this.findSingleUser(userId)));
			let usersObject: User[] = [];
			users.forEach(user => {
				if (user) usersObject.push(user)
			})
			return usersObject;
		}

		return await this.findSingleUser(id);
	}

	/**
	 * get a single user.
	 * @param userId - user id
	 * @private
	 */
	private async findSingleUser(userId: UserId): Promise<User | null> {
		const id = userId.id;
		const client = this.dynamoClient;

		const input: GetItemInput = {
			TableName: TABLE_NAME,
			Key: marshall({
				"PK": id,
				"SK": "User"
			})
		};

		const getItemCommand = new GetItemCommand(input);

		const response = await client.send(getItemCommand);

		if (!response.Item) return null;

		const item = unmarshall(response.Item);

		const userObject = User.createFromPrimitives(
			item.PK,
			item.UserName,
			item.EMailAddress,
		)

		if (userObject.err) {
			throw userObject.error;
		}

		return userObject.value
	}

	/**
	 *
	 * Create a user.
	 * @param user
	 */
	async create(user: User): Promise<undefined> {
		await this.save(user);
	}

	/**
	 * Update a user
	 * @param user
	 */
	async update(user: User): Promise<undefined> {
		await this.save(user);
	}


	/**
	 * Save a user.
	 * @param user
	 * @private
	 */
	private async save(user: User): Promise<undefined> {

		const client = this.dynamoClient;

		const item = {
			PK: user.id.id,
			SK: "User",
			UserName: user.name.name,
			EMailAddress: user.emailAddress.emailAddress,
		};

		const input: PutItemCommandInput = {
			TableName: TABLE_NAME,
			Item: marshall(item)
		};
		const command = new PutItemCommand(input);
		await client.send(command);
		return;
	}

	async delete(id: UserId): Promise<undefined> {
		const client = dynamoClient;
	}
}
