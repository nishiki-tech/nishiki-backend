import { IUserRepository } from "src/User/Domain/UserRepository";
import {User, UserId} from "src/User/Domain/User";

/**
 * This is for explanation, so won't write anything.
 */
class UserRepository implements IUserRepository {
	async find(id: UserId): Promise<User | null> {
		return null
	}

	async create(user: User): Promise<undefined> {}
	async update(user: User): Promise<undefined> {}
	async delete(id: UserId): Promise<undefined> {}
}