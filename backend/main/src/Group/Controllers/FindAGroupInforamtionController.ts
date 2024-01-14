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

		// this query has no chance occurring of errors.
		return this.ok((await this.query.execute({ groupId })).unwrap());
	}
}

interface IFindAGroupData {
	groupId: string;
	groupName: string;
}
