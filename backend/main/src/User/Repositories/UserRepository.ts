import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User/Domain/User";

/**
 * This is for explanation, so won't write anything.
 */
// TODO: for now, the DB hasn't been decided yet. So, the inside the function are mock.
class UserRepository implements IUserRepository {
	async find(id: UserId): Promise<User | null>;
	async find(id: UserId[]): Promise<User[]>;
	async find(id: UserId | UserId[]): Promise<User | User[] | null> {
		// if the ID is array.
		if (Array.isArray(id)) {
			return [];
		}

		return null;
	}

	async create(user: User): Promise<undefined> {}
	async update(user: User): Promise<undefined> {}
	async delete(id: UserId): Promise<undefined> {}
}
