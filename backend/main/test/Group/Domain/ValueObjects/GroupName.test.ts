import { describe, expect, it } from "vitest";
import { GroupName } from "../../../../src/Group/Domain/ValueObjects/GroupName";

describe("GroupName", () => {
	describe("Crate GroupName Object", () => {
		it("success ", () => {
			const groupNameString = "GroupName";
			const groupName = GroupName.create(groupNameString);

			expect(groupName.ok).toBeTruthy();
			expect(groupName.unwrap().name).toBe(groupNameString);
		});

		it("if the GroupName is not provided, the GroupName is set to the default name, Nishiki User", () => {
			const groupName = GroupName.create();

			expect(groupName.ok).toBeTruthy();
			expect(groupName.unwrap().name).toBe("Nishiki Group");
		});

		it("the GroupName is too short", () => {
			const groupName = GroupName.create("");
			expect(groupName.ok).toBeFalsy();
		});

		it("the GroupName is too long, greater than 255", () => {
			// set the string with a length of 256.
			const groupName = GroupName.create("a".repeat(256));
			expect(groupName.ok).toBeFalsy();
		});
	});

	describe("change GroupName", () => {
		it("success", () => {
			const groupName = GroupName.create("Name").unwrap();
			const updated = groupName.changeName("emaN");

			expect(updated.ok).toBeTruthy();
			expect(updated.unwrap().name).toBe("emaN");
		});
	});
});
