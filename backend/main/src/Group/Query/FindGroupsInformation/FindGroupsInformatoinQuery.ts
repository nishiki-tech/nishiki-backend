import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { Err, Ok, Result } from "result-ts-type";
import { GroupData } from "src/Shared/Adapters/DB/NishikiDBTypes";
import { QueryError } from "src/Shared/Utils/Errors";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";

export class FindGroupsInformationQuery
	implements
		IQuery<{ userId: string }, IGroupData, InvalidUUID>
{
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { userId: string }): Promise<
		Result<IGroupData, InvalidUUID>
	> {
		const { userId } = input;

		if (!isValidUUIDV4(userId)) {
			return Err(new InvalidUUID("invalid user ID is provided"));
		}

		const usersGroup =
			await this.nishikiDynamoDBClient.listOfUsersGroup(userId);

		if (usersGroup.length === 0) return Ok({ groups: [] });

		const groups = await Promise.all(
			usersGroup.map(async (group) =>
				this.nishikiDynamoDBClient.getGroup({ groupId: group.groupId }),
			),
		);

		const groupData = groups.filter((group) => group) as GroupData[]; // removed "null" variable

		return Ok({ groups: groupData });
	}
}

export class InvalidUUID extends QueryError {}

export interface IGroupData {
	groups: {
		groupId: string;
		groupName: string;
	}[]
}
