import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { QueryError } from "src/Shared/Utils/Errors";
import { Result, Ok, Err } from "result-ts-type";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";

interface IFindUserQueryResult {
	userId: string;
	username: string;
}

/**
 * Find user by ID.
 */
export class FindUserQuery
	implements IQuery<string, IFindUserQueryResult | null, InvalidID>
{
	private readonly nishikiDynamoDBClient: NishikiDynamoDBClient;

	constructor(nishikiDynamoDBClient: NishikiDynamoDBClient) {
		this.nishikiDynamoDBClient = nishikiDynamoDBClient;
	}

	/**
	 * Find the user by ID.
	 * @param request - the request to find the user.
	 * @returns the user data. If the user does not exist, it returns null.
	 */
	public async execute(
		request: string,
	): Promise<Result<IFindUserQueryResult | null, InvalidID>> {
		if (!isValidUUIDV4(request)) {
			return Err(new InvalidID(`[Invalid USER ID]: ${request}`));
		}

		const user = await this.nishikiDynamoDBClient.getUser({ userId: request });

		return Ok(user ? { userId: user.userId, username: user.username } : null);
	}
}

export class InvalidID extends QueryError {}
