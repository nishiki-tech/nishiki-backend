import { describe, expect, it, test } from "vitest";
import { Food } from "../../../src/Group/Domain/Entities/Food";
import { FoodDomainError } from "../../../src/Group/Domain/Entities/Food";
import { Quantity } from "../../../src/Group/Domain/Quantity";
import { Expiry } from "../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../src/Group/Domain/ValueObjects/Unit";

describe("Food Object", () => {
	describe("creating food object", () => {
		const unit = Unit.create({ name: "g" });
		const quantity = Quantity.create(100);
		const expiry = Expiry.create({ date: new Date(2023, 11, 1) });
		const foodId = "foodId";
		const fullFoodProps = {
			name: "dummy food name",
			unit: unit,
			quantity: quantity,
			expiry: expiry,
		};

		const requiredFoodProps = {
			name: "dummy food name",
		};

		it("success with full food props", () => {
			const food = Food.create(foodId, {
				...fullFoodProps,
			});
			expect(food.ok).toBeTruthy();
			expect(food.value!.name).toBe(fullFoodProps.name);
		});

		it("success with required food props", () => {
			const food = Food.create(foodId, {
				...requiredFoodProps,
			});
			expect(food.ok).toBeTruthy();
			expect(food.value!.name).toBe(fullFoodProps.name);
			expect(food.value!.unit).toBeUndefined();
			expect(food.value!.quantity).toBeUndefined();
			expect(food.value!.expiry).toBeUndefined();
		});

		it("food name too long", () => {
			const food = Food.create(foodId, {
				name: "abcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxy", // 51 characters
			});
			expect(food.ok).toBeFalsy();
		});
	});
});

		});
	});
});
