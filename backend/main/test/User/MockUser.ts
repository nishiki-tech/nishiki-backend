import { User, UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";
import { Err } from "src/Shared";

export class MockUserId extends UserId {
	static createMock(id: string): MockUserId {
		return new MockUserId(id);
	}
}

export class MockUser extends User {
	static crateMock(id: UserId, name: string) {
		const username = Username.create(name);
		const emailAddress = EmailAddress.create("bar@nishiki.com");
		if (!(username.ok && emailAddress.ok)) {
			if (!username.ok) throw username.error;
			if (!emailAddress.ok) throw emailAddress.error;
		}
		return new MockUser(id, {
			username: username.value,
			emailAddress: emailAddress.value,
		});
	}
}
