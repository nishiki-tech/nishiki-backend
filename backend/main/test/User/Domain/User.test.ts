import { describe, expect, it, test } from "vitest";
import { User, UserId } from "../../../src/User";
import {
	UserDomainError,
	UserIdDomainError,
} from "../../../src/User/Domain/User";

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

	describe("creating user", () => {
		it("success", () => {
			const userName = "dummy user name";

			const user = User.create(userId, {
				name: userName,
			});

			expect(user.ok).toBeTruthy();
			expect(user.value!.name).toBe(userName);
		});

		it("if a username is not provided, it gets to be the default name", () => {
			const user = User.create(userId, {});

			expect(user.ok).toBeTruthy();
			expect(user.value.name).toBe("Nishiki User");
		});

		it("user name too long", () => {
			const user = User.create(userId, {
				name: "123456789012w3456789012345678901", // 31 digit
			});

			expect(user.ok).toBeFalsy();
			expect(user.error).toBeInstanceOf(UserDomainError);
		});
	});

	describe("change user name", () => {
		const user = User.create(userId, { name: "user name" }).value!;

		it("change user name", () => {
			const changeTo = "changedUserName";
			const changedNameUser = user.changeUserName(changeTo);

			expect(changedNameUser.ok).toBeTruthy();
			expect(changedNameUser.value.name).toBe(changeTo);
		});
	});
});
