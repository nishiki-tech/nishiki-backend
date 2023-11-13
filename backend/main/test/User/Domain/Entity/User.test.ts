import { describe, expect, it, test } from "vitest";
import { User, UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";
import {
	EmailAddress,
	EmailAddressError,
} from "src/User/Domain/ValueObject/EmailAddress";
import { v4 as uuidv4 } from "uuid";

describe("User ID", () => {
	it("correct ID", () => {
		const correctId = uuidv4();
		const userId = UserId.create(correctId);
		expect(userId.ok).toBeTruthy();
		expect(userId.unwrap().id).toBe(correctId);
	});

	it("incorrect uuid", () => {
		const writtenByHand = "aaaaaaaa-1111-1111-1111-111111111111";
		expect(UserId.create(writtenByHand).ok).toBeFalsy();
	});
});

describe("User Object", () => {
	const userId: UserId = UserId.generate()!;
	const username: Username = Username.create("dummy user name").unwrap();
	const emailAddress: EmailAddress =
		EmailAddress.create("bar@nishiki.com").unwrap();

	describe("creating user", () => {
		it("success", () => {
			const user = User.create(userId, {
				username,
				emailAddress,
			});

			expect(user.name).toMatchObject(username);
		});
	});

	describe("change username", () => {
		const user = User.create(userId, { username, emailAddress });

		it("change user name", () => {
			const changeTo = Username.create("changedUserName").unwrap();
			const changedNameUser = user.changeUsername(changeTo);
			expect(changedNameUser.name).toEqual(changeTo);
		});
	});
});
