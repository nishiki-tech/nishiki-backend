import { describe, expect, it } from "vitest";
import { Username } from "../../../../src/User/Domain/ValueObject/Username";

describe("Username", () => {
	describe("Crate Username Object", () => {
		it("success ", () => {
			const USERNAME = "username";
			const username = Username.create(USERNAME);

			expect(username.ok).toBeTruthy();
			expect(username.value.name).toBe(USERNAME);
		});

		it("if the username is not provided, the username is set to the default name, Nishiki User", () => {
			const username = Username.create();

			expect(username.ok).toBeTruthy();
			expect(username.value.name).toBe("Nishiki User");
		});

		it("the username is too short", () => {
			const username = Username.create("");
			expect(username.ok).toBeFalsy();
		});

		it("the username is too long, greater than 30", () => {
			// set the string with a length of 31.
			const username = Username.create(new Array(31).fill("a").join());
			expect(username.ok).toBeFalsy();
		});
	});

	describe("change username", () => {
		it("success", () => {
			const username = Username.create("Name").value;
			const updated = username.changeName("emaN");

			expect(updated.ok).toBeTruthy();
			expect(updated.value.name).toBe("emaN");
		});
	});
});
