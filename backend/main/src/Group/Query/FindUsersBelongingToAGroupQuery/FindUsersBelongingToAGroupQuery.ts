import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { Err, Ok, Result } from "result-ts-type";
import { QueryError } from "src/Shared/Utils/Errors";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";

export class FindUsersBelongingToAGroupQuery
	implements IQuery<{ groupId: string }, { users: IUser[] }, InvalidUUIDV4>
{
	constructor(public readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { groupId: string }): Promise<
		Result<{ users: IUser[] }, InvalidUUIDV4>
	> {
		const { groupId } = input;

		if (!isValidUUIDV4(groupId)) {
			return Err(new InvalidUUIDV4());
		}

		const result = await this.nishikiDynamoDBClient.listOfUsersInGroup(groupId);

		if (result.length === 0) return Ok({ users: [] });

		const usersData = await Promise.all(
			result.map((user) =>
				this.nishikiDynamoDBClient.getUser({ userId: user.userId }),
			),
		);

		const users: IUser[] = [];

		for (const userData of usersData) {
			if (userData) {
				users.push({
					id: userData.userId,
					name: userData.username,
				});
			}
		}

		return Ok({ users: users });
	}
}

export class InvalidUUIDV4 extends QueryError {}

interface IUser {
	id: string;
	name: string;
}
