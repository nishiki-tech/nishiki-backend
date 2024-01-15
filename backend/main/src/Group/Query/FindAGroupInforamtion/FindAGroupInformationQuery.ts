import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { Err, Ok, Result } from "result-ts-type";
import { QueryError } from "src/Shared/Utils/Errors";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";
import { InvalidID } from "src/User/Query/FindUser/FindUserQuery";

export class FindAGroupInformationQuery
	implements IQuery<{ groupId: string }, IGroupInformation | null, InvalidID>
{
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { groupId: string }): Promise<
		Result<IGroupInformation | null, InvalidID>
	> {
		const { groupId } = input;

		if (!isValidUUIDV4(groupId)) {
			return Err(new InvalidUUIDV4());
		}

		const result = await this.nishikiDynamoDBClient.getGroup({ groupId });

		return Ok(
			result ? { groupId: result.groupId, groupName: result.groupName } : null,
		);
	}
}

export class InvalidUUIDV4 extends QueryError {}

interface IGroupInformation {
	groupId: string;
	groupName: string;
}
