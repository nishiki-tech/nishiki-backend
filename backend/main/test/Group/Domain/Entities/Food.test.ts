import { describe, expect, it, test } from "vitest";
import { Food } from "../../../../src/Group/Domain/Entities/Food";
import {
	Quantity,
	QuantityError,
} from "../../../../src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../../src/Group/Domain/ValueObjects/Unit";

describe("Food Entity", () => {
	const unit = Unit.create({ name: "g" }).value;
	const quantity = Quantity.create(1).value;
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) }).value;
	const foodId = "foodId";

	const requiredFoodProps = {
		name: "dummy food name",
		unit: unit,
		quantity: quantity,
	};
	const fullFoodProps = {
		...requiredFoodProps,
		expiry: expiry,
	};
	describe("Construct Food Object", () => {
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
			expect(food.value!.unit).toBe(fullFoodProps.unit);
			expect(food.value!.quantity).toBe(fullFoodProps.quantity);
			expect(food.value!.expiry).toBeUndefined();
		});

		it("food name too long", () => {
			const food = Food.create(foodId, {
				...requiredFoodProps,
				name: "abcdefghijklmnopqlstuvwxyzabcdefghijklmnopqlstuvwxy", // 51 characters
			});
			expect(food.ok).toBeFalsy();
		});
	});

	describe("Food Object Method", () => {
		const foodWithRequiredProps = Food.create(foodId, requiredFoodProps).value!;
		const foodWithFullProps = Food.create(foodId, fullFoodProps).value!;

		describe("change food name", () => {
			it("change user name", () => {
				const changedFoodName = "changedFoodName";
				const changedFood =
					foodWithFullProps.changeName(changedFoodName).value!;
				expect(changedFood.name).toBe(changedFoodName);
			});
		});

		describe("change food unit", () => {
			it("change food unit", () => {
				const changedFoodUnit = Unit.create({ name: "Liter" }).value;
				const changedFood =
					foodWithFullProps.changeUnit(changedFoodUnit).value!;
				expect(changedFood.unit).toMatchObject(changedFoodUnit);
			});
		});

		describe("change food quantity", () => {
			it("add food quantity", () => {
				const changedFoodQuantity = Quantity.create(200).value;
				const expectedFoodQuantity = Quantity.create(201).value;

				const changedFood =
					foodWithFullProps.addQuantity(changedFoodQuantity).value!;
				expect(changedFood.quantity).toMatchObject(expectedFoodQuantity);
			});
			it("subtract food quantity", () => {
				const changedFoodQuantity = Quantity.create(1).value;
				const expectedFoodQuantity = Quantity.create(0).value;

				const changedFood =
					foodWithFullProps.subtractQuantity(changedFoodQuantity).value!;
				expect(changedFood.quantity).toMatchObject(expectedFoodQuantity);
			});
			it("subtract food quantity when it's going to be minus", () => {
				const food = Food.create(foodId, {
					...foodWithRequiredProps,
					name: "dummy food name",
				}).value!;
				const changedFoodQuantity = Quantity.create(2).value;

				const changedFood =
					foodWithRequiredProps.subtractQuantity(changedFoodQuantity);
				expect(changedFood.error).instanceOf(QuantityError);
			});
		});

		describe("change food expiry", () => {
			it("change food unit", () => {
				const changedFoodExpiry = Expiry.create({
					date: new Date(2023, 11, 2),
				}).value;
				const changedFood =
					foodWithFullProps.changeExpiry(changedFoodExpiry).value!;
				expect(changedFood.expiry).toMatchObject(changedFoodExpiry);
			});
		});
	});
});
