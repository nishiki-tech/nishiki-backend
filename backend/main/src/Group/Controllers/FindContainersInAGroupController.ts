import { Controller } from "src/Shared";
import {
	FindContainersInAGroupQuery,
	IContainerData,
} from "src/Group/Query/FindContainersInAGroupQuery/FindContainersInAGroupQuery";

export class FindContainersInAGroupController extends Controller<
	{ groupId: string },
	IContainerData
> {
	constructor(readonly query: FindContainersInAGroupQuery) {
		super();
	}

	protected async handler(input: { groupId: string }) {
		const { groupId } = input;
		const result = await this.query.execute({ groupId });
		if (result.err) return this.badRequest(result.error.message);
		return this.ok(result.value);
	}
}
