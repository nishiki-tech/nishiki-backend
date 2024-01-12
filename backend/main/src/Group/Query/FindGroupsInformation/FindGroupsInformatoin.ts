import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { Ok, Result } from "result-ts-type";
import { GroupData } from "src/Shared/Adapters/DB/NishikiDBTypes";

export class FindGroupsInformation
	implements IQuery<{ userId: string }, IGroupInformation[], never>
{
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { userId: string }): Promise<
		Result<IGroupInformation[], never>
	> {
		const { userId } = input;

		const usersGroup =
			await this.nishikiDynamoDBClient.listOfUsersGroup(userId);

		if (usersGroup.length === 0) return Ok([]);

		const groups = await Promise.all(
			usersGroup.map(async (group) =>
				this.nishikiDynamoDBClient.getGroup({ groupId: group.groupId }),
			),
		);

		const groupData = groups.filter((group) => group) as GroupData[]; // removed "null" variable

		return Ok(groupData);
	}
}

interface IGroupInformation {
	groupId: string;
	groupName: string;
}
