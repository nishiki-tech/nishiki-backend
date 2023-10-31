import { describe, expect, it, test } from "vitest";
import { Food } from "../../../../src/Group/Domain/Entities/Food";
import { FoodDomainError } from "../../../../src/Group/Domain/Entities/Food";
import { Quantity } from "../../../../src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../../src/Group/Domain/ValueObjects/Unit";

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

describe("Food Object", () => {
	const unit = Unit.create({ name: "g" }).value;
	const quantity = Quantity.create(1).value;
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) }).value;
	const foodId = "foodId";
	const foodWithFullProps = Food.create(foodId, {
		name: "dummy food name",
		quantity: quantity,
		unit: unit,
		expiry: expiry,
	}).value!;
	const foodWithRequiredProps = Food.create(foodId, {
		name: "dummy food name",
	}).value!;

	describe("change food name", () => {
		it("change user name", () => {
			const changedFoodName = "changedFoodName";
			const changedFood = foodWithFullProps.changeName(changedFoodName).value!;
			expect(changedFood.name).toBe(changedFoodName);
		});
	});

	describe("change food unit", () => {
		it("change food unit", () => {
			const changedFoodUnit = Unit.create({ name: "Liter" }).value;
			const changedFood = foodWithFullProps.changeUnit(changedFoodUnit).value!;
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
		it("add food quantity when it's undefined", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
			}).value!;
			const changedFoodQuantity = Quantity.create(200).value;
			const expectedFoodQuantity = Quantity.create(200).value;

			const changedFood =
				foodWithRequiredProps.addQuantity(changedFoodQuantity).value!;
			expect(changedFood.quantity).toMatchObject(expectedFoodQuantity);
		});
		it("subtract food quantity when it's undefined", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
			}).value!;
			const changedFoodQuantity = Quantity.create(1).value;

			const changedFood =
				foodWithRequiredProps.subtractQuantity(changedFoodQuantity);
			expect(changedFood.error).instanceOf(FoodDomainError);
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
