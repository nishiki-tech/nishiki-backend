import { describe, expect, it, test } from "vitest";
import { Unit, UnitDomainError } from "../../../src/Group/Domain/ValueObjects/Unit";

describe("Unit Object", () => {
	describe("creating unit", () => {
		it("success", () => {
			const unitName = "kilogram";

			const unit = Unit.create({
				name: unitName,
			});

			expect(unit.ok).toBeTruthy();
			expect(unit.value!.name).toBe(unitName);
		});

		it("unit name too long", () => {
			const unitName = "123456789012345678901"; // 21 character
			const unit = Unit.create({
				name: unitName,
			});

			expect(unit.ok).toBeFalsy();
			expect(unit.error).toBeInstanceOf(UnitDomainError);
		});
	});
});
