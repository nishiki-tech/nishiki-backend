import { describe, expect, it, test } from "vitest";
import { Food } from "../../../src/Food/Domain/Food";
import { FoodDomainError } from "../../../src/Food/Domain/Food";
import { Unit } from "../../../src/Food/Domain/Unit";
import { Quantity } from "../../../src/Group/Domain/Quantity";
import { Expiry } from "../../../src/Food/Domain/Expiry";

describe("Food Object", () => {
	describe("creating food", () => {
		const unit = Unit.create({ name: "g" });
		const quantity = Quantity.create(100);
		const expiry = Expiry.create({ date: new Date(2023, 11, 1) });
		const foodProps = {
			name: "dummy food name",
			unit: unit,
			quantity: quantity,
			expiry: expiry,
		};
        const food = Food.create("11111111-1111-1111-1111-111111111111", {
            ...foodProps,
        });
		it("success", () => {
			

			expect(food.ok).toBeTruthy();
			expect(food.value!.name).toBe(foodProps.name);
		});

		it("food name too long", () => {
            const changedExpiryFood = food.value.changeExpiry(Expiry.create({ date: new Date(2023, 11, 1) }).value);
            
            console.log(changedExpiryFood)
            console.log(changedExpiryFood.value!.expiry.date)
            console.log(changedExpiryFood.ok)

			expect(changedExpiryFood.ok).toBeTruthy();
            
            expect(changedExpiryFood.value!.expiry).toStrictEqual(Expiry.create({ date: new Date(2023, 11, 1) }).value);
		});
	});
});
