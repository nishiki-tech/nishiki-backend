import { Controller } from "src/Shared";
import {
	FindContainerQuery,
	IGetContainerReturnData,
} from "src/Group/Query/FindContainer/FindContanerQuery";
import { UserIsNotAuthorized } from "src/Group/Query/FindContainer/IFindContainerUseCase";

interface IFindContainerInput {
	userId: string;
	containerId: string;
}

export class FindContainerController extends Controller<
	IFindContainerInput,
	IGetContainerReturnData | null
> {
	readonly query: FindContainerQuery;

	constructor(query: FindContainerQuery) {
		super();
		this.query = query;
	}
	protected async handler(input: IFindContainerInput) {
		const { userId, containerId } = input;

		const result = await this.query.execute({ userId, containerId });

		if (!result.ok) {
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
