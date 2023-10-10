import {User, UserId} from "src/User";

export class MockUserId extends UserId {
	static createMock(id: string): MockUserId {
		return new MockUserId(id);
	}
}

export class MockUser extends User {
	static crateMock(id: UserId, name: string, isAdmin: boolean = false) {
		return new MockUser(id, { name, isAdmin });
	}
}