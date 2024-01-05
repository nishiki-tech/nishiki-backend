import { Controller } from "src/Shared";
import { FindUserQuery } from "src/User/Query/FindUser/FindUserQuery";

/**
 * Find a user(s) controller.
 * When you want to find a user, you can use this controller.
 * The arguments are the user id(s) you want to find.
 * If a shingle user ID is given, the controller will return a user data.
 * If a list of user IDs is given, the controller will return a list of user data.
 */
export class FindUserController extends Controller<
	string | string[],
	IFindUserData | IFindUserData[] | null
> {
	constructor(readonly query: FindUserQuery) {
		super();
	}

	async handler(userId: string | string[]) {
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
	emailAddress: string;
}
