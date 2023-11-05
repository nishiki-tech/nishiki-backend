import { describe, expect, it, test } from "vitest";
import { User, UserId } from "../../../../src/User";
import { Username } from "../../../../src/User/Domain/ValueObject/Username";
import {
	EmailAddress,
	EmailAddressError,
} from "../../../../src/User/Domain/ValueObject/EmailAddress";

describe("User ID", () => {
	it("correct ID", () => {
		const correctId = "aaaaaaaa-1111-1111-1111-111111111111";
		const userId = UserId.create(correctId);
		expect(userId.ok).toBeTruthy();
		expect(userId.value.id).toBe(correctId);
	});

	it("No Hyphen", () => {
		const noHyphen = "aaaaaaaa111111111111111111111111";
		expect(UserId.create(noHyphen).ok).toBeFalsy();
	});

	it("Less Length", () => {
		const lessLength = "aaaaaaaa-1111-1111-1111-11111111111";
		expect(UserId.create(lessLength).ok).toBeFalsy();
	});

	it("Too Long", () => {
		const tooLong = "aaaaaaaa-1111-1111-1111-1111111111111";
		expect(UserId.create(tooLong).ok).toBeFalsy();
	});
});

describe("User Object", () => {
	const id = "11111111-1111-1111-1111-111111111111";
	const userId: UserId = UserId.create(id).value!;
	const username: Username = Username.create("dummy user name").value;
	const emailAddress: EmailAddress =
		EmailAddress.create("bar@nishiki.com").value;

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
			const changeTo = Username.create("changedUserName").value;
			const changedNameUser = user.changeUsername(changeTo);
			expect(changedNameUser.name).toEqual(changeTo);
		});
	});
});
