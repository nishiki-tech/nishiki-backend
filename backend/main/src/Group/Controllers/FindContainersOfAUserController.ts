import { Controller } from "src/Shared";
import {
	FindContainersOfAUserQuery,
	IContainerData,
} from "src/Group/Query/FindContainersOfAUserQuery/FindContainersOfAUserQuery";

export class FindContainersOfAUserController extends Controller<
	{ userId: string },
	IContainerData
> {
	constructor(readonly query: FindContainersOfAUserQuery) {
		super();
	}

	protected async handler(input: { userId: string }) {
		const { userId } = input;
		const result = await this.query.execute({ userId });
		if (result.err) return this.badRequest(result.error.message);
		return this.ok(result.value);
	}
}
