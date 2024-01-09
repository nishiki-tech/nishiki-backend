import { Controller } from "src/Shared";
import { FindUserQuery } from "src/User/Query/FindUser/FindUserQuery";

/**
 * Find a user controller.
 * When you want to find a user, you can use this controller.
 * The arguments are the user id you want to find.
 */
export class FindUserController extends Controller<
	string,
	IFindUserData | null
> {
	constructor(readonly query: FindUserQuery) {
		super();
	}

	async handler(userId: string) {
		const result = await this.query.execute(userId);

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}

interface IFindUserData {
	userId: string;
	username: string;
}
