import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { QueryError } from "src/Shared/Utils/Errors";
import { Result, Ok, Err } from "result-ts-type";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";

interface IFindUserQueryResult {
	userId: string;
	username: string;
	emailAddress: string;
}

/**
 * Find user by ID.
 * If the request is an array, it will return an array of users.
 * If the request is a string, it will return a single user.
 */
export class FindUserQuery
	implements
		IQuery<
			string | string[],
			IFindUserQueryResult | IFindUserQueryResult[] | null,
			InvalidID
		>
{
	private readonly nishikiDynamoDBClient: NishikiDynamoDBClient;

	constructor(nishikiDynamoDBClient: NishikiDynamoDBClient) {
		this.nishikiDynamoDBClient = nishikiDynamoDBClient;
	}

	/**
	 * Find the user by ID.
	 * If the array of user IDs are provided, it will return an array of users.
	 * @param request - the request to find the user.
	 * @returns the user data. If the user does not exist, it returns null.
	 */
	public async execute(
		request: string | string[],
	): Promise<
		Result<IFindUserQueryResult | IFindUserQueryResult[] | null, InvalidID>
	> {
		if (Array.isArray(request)) {
			if (request.length === 0) return Ok([]);

			const userIds = [];

			for (const id of request) {
				if (!isValidUUIDV4(id)) {
					return Err(new InvalidID(`[Invalid USER ID]: ${id}`));
				}
				userIds.push(id);
			}

			const result = await Promise.all(
				userIds.map((userId) => this.nishikiDynamoDBClient.getUser({ userId })),
			);
			const users: IFindUserQueryResult[] = [];
			for (const user of result) {
				if (user) {
					const { userId, username, emailAddress } = user;
					users.push({ userId, username, emailAddress });
				}
			}
			return Ok(users);
		}

		if (!isValidUUIDV4(request)) {
			return Err(new InvalidID(`[Invalid USER ID]: ${request}`));
		}

		const user = await this.nishikiDynamoDBClient.getUser({ userId: request });

		return Ok(user);
	}
}

export class InvalidID extends QueryError {}
