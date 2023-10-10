import {describe, expect, test} from "vitest";
import {UserId} from "../../../src/User";

describe("user domain class", () => {
	test("user id", () => {
		const userId = UserId.create("userId");

		expect(userId.ok).toBeTruthy();
	})

	test("user domain class", () => {
		expect(true).toBeTruthy();
	})
})