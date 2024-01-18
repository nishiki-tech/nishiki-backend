import { Controller } from "src/Shared";
import { FindAGroupInformationQuery } from "src/Group/Query/FindAGroupInforamtion/FindAGroupInformationQuery";

export class FindAGroupInformationController extends Controller<
	{ groupId: string },
	IFindAGroupData | null
> {
	readonly query: FindAGroupInformationQuery;
	constructor(query: FindAGroupInformationQuery) {
		super();
		this.query = query;
	}

	protected async handler(input: { groupId: string }) {
		const { groupId } = input;

		const result = await this.query.execute({ groupId });

		if (result.err) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}

interface IFindAGroupData {
	groupId: string;
	groupName: string;
}
