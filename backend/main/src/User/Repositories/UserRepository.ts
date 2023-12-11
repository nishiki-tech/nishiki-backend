import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User/Domain/Entity/User";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { UserData } from "src/Shared/Adapters/DB/NishikiDBTypes";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";
import { Username } from "src/User/Domain/ValueObject/Username";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";
import { hasError } from "result-ts-type";

/**
 * User repository.
 * The user item's definition is described in the following document.
 * @link https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#user
 */
export class UserRepository implements IUserRepository {
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

	async find(id: UserId): Promise<User | null>;
	async find(id: UserId[]): Promise<User[]>;
	async find(id: UserId | UserId[]): Promise<User | User[] | null> {
		// if the ID is array.
		if (Array.isArray(id)) {
			const users = await Promise.all(
				id.map((userId) => this.nishikiDbClient.getUser(userId.id)),
			);

			const usersObject: User[] = [];

			for (const user of users) {
				if (user) {
					const userObject = createUserObject(user);
					usersObject.push(userObject);
				}
			}

			return usersObject;
		}

		const userData = await this.nishikiDbClient.getUser(id.id);

		return userData ? createUserObject(userData) : null;
	}

	/**
	 *
	 * Create a user.
	 * @param user
	 */
	async create(user: User): Promise<undefined> {
		await this.nishikiDbClient.saveUser({
			userId: user.id.id,
			username: user.name.name,
			emailAddress: user.emailAddress.emailAddress,
		});
	}

	/**
	 * Update a user
	 * @param user
	 */
	async update(user: User): Promise<undefined> {
		await this.nishikiDbClient.saveUser({
			userId: user.id.id,
			username: user.name.name,
			emailAddress: user.emailAddress.emailAddress,
		});
	}

	/**
	 * Delete a user
	 * @param id - target user id
	 */
	async delete(id: UserId): Promise<undefined> {
		await this.nishikiDbClient.deleteUser(id.id);
	}
}

/**
 * Create a user from primitive values.
 * When userData is invalid, this function throws an error.
 * @param userData
 * @throws UserRepositoryError - this error will be thrown when the data is invalid.
 */
const createUserObject = (userData: UserData): User => {
	const userIdOrErr = UserId.create(userData.userId);
	const emailOrErr = EmailAddress.create(userData.emailAddress);
	const usernameOrErr = Username.create(userData.username);

	const errorResult = hasError([userIdOrErr, emailOrErr, usernameOrErr]);

	if (errorResult.err) {
		const report = [`UserId: ${userData.userId}`, errorResult.error.message];
		throw new UserRepositoryError(errorResult.error.message, report);
	}

	const userId = userIdOrErr.unwrap();
	const email = emailOrErr.unwrap();
	const name = usernameOrErr.unwrap();

	return User.create(userId, {
		emailAddress: email,
		username: name,
	});
};

class UserRepositoryError extends RepositoryError {
	constructor(message: string, report: string | string[]) {
		super("UserRepositoryError", message, report);
	}
}
