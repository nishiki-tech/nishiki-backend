import { User, UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";

export class MockUserId extends UserId {
	static createMock(id: string): MockUserId {
		return new MockUserId(id);
	}
}

export class MockUser extends User {
	static crateMock(id: UserId, name: string) {
		const username = Username.create(name).value;
		const emailAddress = EmailAddress.create("bar@nishiki.com").value;
		if (!username.ok) {
			throw Error(username.error.message);
		}
		return new MockUser(id, { username, emailAddress });
	}
}

export const DUMMY_USER_ID = "12345678-1324-1234-1234-123456789012";
