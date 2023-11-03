import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User";

export class MockUserRepository implements IUserRepository {
	memoryUsers: User[] = [];

	async find(id: UserId): Promise<User | null>;
	async find(id: UserId[]): Promise<User[]>;
	async find(id: UserId | UserId[]): Promise<User | null | User[]> {
		if (Array.isArray(id)) {
			return this.memoryUsers.filter((inMemory) =>
				id.find((el) => el.equal(inMemory.id)),
			);
		}
		return this.memoryUsers.find((user) => user.id.equal(id)) || null;
	}
	async create(user: User): Promise<undefined> {
		this.memoryUsers.push(user);
	}
	async update(user: User): Promise<undefined> {
		if (this.memoryUsers.find((el) => el.id.equal(user.id))) {
			this.memoryUsers = this.memoryUsers.map((el) =>
				el.id.equal(user.id) ? user : el,
			);
		}
	}
	async delete(id: UserId): Promise<undefined> {
		this.memoryUsers = this.memoryUsers.filter((el) => !el.id.equal(id));
	}

	public pushDummyData(user: User) {
		this.memoryUsers.push(user);
	}
}
