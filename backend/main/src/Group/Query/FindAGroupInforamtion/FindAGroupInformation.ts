import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { Ok, Result } from "result-ts-type";

export class FindAGroupInformation
	implements IQuery<{ groupId: string }, IGroupInformation | null, never>
{
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { groupId: string }): Promise<
		Result<IGroupInformation | null, never>
	> {
		const { groupId } = input;

		const result = await this.nishikiDynamoDBClient.getGroup({ groupId });

		return Ok(
			result ? { groupId: result.groupId, groupName: result.groupName } : null,
		);
	}
}

interface IGroupInformation {
	groupId: string;
	groupName: string;
}
