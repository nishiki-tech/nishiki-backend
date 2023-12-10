import { IUserRepository } from "src/User/Domain/IUserRepository";
import {
	User,
	UserDomainError,
	UserId,
	UserIdDomainError,
} from "src/User/Domain/Entity/User";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { UserData } from "src/Shared/Adapters/DB/NishikiDBTypes";
import { Err, hasError, Ok, Result } from "result-ts-type";
import {
	EmailAddress,
	EmailAddressError,
} from "src/User/Domain/ValueObject/EmailAddress";
import {
	Username,
	UserNameDomainError,
} from "src/User/Domain/ValueObject/Username";
import {RepositoryError} from "src/Shared/Layers/Repository/RepositoryError";

/**
 * User repository.
 * The user item's definition is described in the following document.
 * @link https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#user
 */
class UserRepository implements IUserRepository {
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
					if (userObject.err) {
						throw new Error();
					}
					usersObject.push(userObject.value);
				}
			}

			return usersObject;
		}

		return await this.findSingleUser(id);
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
 * create a user from primitive values.
 * @param userData
 */
const createUserObject = (
	userData: UserData,
): Result<
	User,
	UserIdDomainError | UserDomainError | EmailAddressError | UserNameDomainError
> => {
	const userIdOrErr = UserId.create(id);
	const emailOrErr = EmailAddress.create(emailAddress);
	const usernameOrErr = Username.create(username);

	const errorResult = hasError([userIdOrErr, emailOrErr, usernameOrErr]);

	if (errorResult.err) {
		return Err(errorResult.error);
	}

	const userId = userIdOrErr.unwrap();
	const email = emailOrErr.unwrap();
	const name = usernameOrErr.unwrap();

	return Ok(
		this.create(userId, {
			emailAddress: email,
			username: name,
		}),
	);
};


class UserRepositoryError extends RepositoryError {}