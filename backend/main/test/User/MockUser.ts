import { User, UserId } from "src/User";

export class MockUserId extends UserId {
	static createMock(id: string): MockUserId {
		return new MockUserId(id);
	}
}

export class MockUser extends User {
	static crateMock(id: UserId, name: string) {
		return new MockUser(id, { name });
	}
}

export const DUMMY_USER_ID = "12345678-1324-1234-1234-123456789012";
