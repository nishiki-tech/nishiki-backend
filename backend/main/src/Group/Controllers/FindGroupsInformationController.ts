import { Controller } from "src/Shared";
import {
	FindGroupsInformationQuery,
	IGroupData,
} from "src/Group/Query/FindGroupsInformation/FindGroupsInformatoinQuery";

export class FindGroupsInformationController extends Controller<
	{ userId: string },
	IGroupData
> {
	constructor(private readonly query: FindGroupsInformationQuery) {
		super();
	}

	protected async handler(input: { userId: string }) {
		const { userId } = input;

		const result = await this.query.execute({ userId });

		if (result.err) return this.badRequest(result.error.message);

		return this.ok(result.value);
	}
}
