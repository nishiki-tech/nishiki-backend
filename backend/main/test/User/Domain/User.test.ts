import {describe, expect, test} from "vitest";
import {User} from "../../../src/User";
import {MockUserId} from "../MockUser";

describe("user domain class", () => {
	const userId = MockUserId.createMock("userId");

	test("create user domain class", () => {
		const user = User.create(userId, { name: "name" })
		expect(user.ok).toBeTruthy();
	})

	test("too long name", () => {
		const name = new Array(101).fill("a").join("");
		const user = User.create(userId, { name });

		expect(user.ok).toBeFalsy();

	})
})