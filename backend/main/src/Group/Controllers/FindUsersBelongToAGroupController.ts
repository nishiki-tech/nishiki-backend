import { Controller } from "src/Shared";
import {
	FindUsersBelongingToAGroupQuery,
	IUser,
} from "src/Group/Query/FindUsersBelongingToAGroupQuery/FindUsersBelongingToAGroupQuery";

export class FindUsersBelongToAGroupController extends Controller<
	{ groupId: string },
	{ users: IUser[] }
> {
	constructor(private readonly query: FindUsersBelongingToAGroupQuery) {
		super();
	}

	async handler(request: { groupId: string }) {
		const result = await this.query.execute(request);
		if (result.err) return this.badRequest(result.error.message);
		return this.ok(result.value);
	}
}
