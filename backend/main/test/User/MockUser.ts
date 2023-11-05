import { User, UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";

export class MockUserId extends UserId {
	static createMock(id: string): MockUserId {
		return new MockUserId(id);
	}
}

export class MockUser extends User {
	static crateMock(id: UserId, name: string) {
		const username = Username.create(name);
		if (!username.ok) {
			throw Error(username.error.message);
		}
		return new MockUser(id, { username: username.value });
	}
}
