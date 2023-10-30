import { describe, expect, it, test } from "vitest";
import { Food } from "../../../src/Group/Domain/Entities/Food";
import { FoodDomainError } from "../../../src/Group/Domain/Entities/Food";
import { Quantity } from "../../../src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../../../src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "../../../src/Group/Domain/ValueObjects/Unit";
add: some test cases when missing non-required props.
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
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) }).value;
	const foodId = "foodId";

	describe("change food name", () => {
		it("change user name", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
				expiry: expiry,
			}).value!;
			const changedFoodName = "changedFoodName";
			food.changeName("changedFoodName");
			expect(food.name).toBe(changedFoodName);
		});
	});

	describe("change food unit", () => {
		it("change food unit", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
				unit: unit,
			}).value!;
			const changedFoodUnit = Unit.create({ name: "Liter" }).value;
			food.changeUnit(changedFoodUnit);
			expect(food.unit).toBe(changedFoodUnit);
		});
	});

	describe("change food quantity", () => {
		it("add food quantity", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
				quantity: Quantity.create(1).value,
			}).value!;
			const changedFoodQuantity = Quantity.create(200).value;
			const expectedFoodQuantity = Quantity.create(201).value;

			food.addQuantity(changedFoodQuantity);
			expect(food.quantity).toMatchObject(expectedFoodQuantity);
		});
		it("subtruct food quantity", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
				quantity: Quantity.create(1).value,
			}).value!;
			const changedFoodQuantity = Quantity.create(1).value;
			const expectedFoodQuantity = Quantity.create(0).value;

			food.subtractQuantity(changedFoodQuantity);
			expect(food.quantity).toMatchObject(expectedFoodQuantity);
		});
		it("add food quantity when it's undefined", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
			}).value!;
			const changedFoodQuantity = Quantity.create(200).value;
			const expectedFoodQuantity = Quantity.create(200).value;

			food.addQuantity(changedFoodQuantity);
			expect(food.quantity).toMatchObject(expectedFoodQuantity);
		});
		it("subtruct food quantity when it's undefined", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
			}).value!;
			const changedFoodQuantity = Quantity.create(1).value;
			const expectedFoodQuantity = Quantity.create(0).value;

			expect(() => food.subtractQuantity(changedFoodQuantity)).toThrowError(
				"Quantity is undefined",
			);
		});
	});

	describe("change food expiry", () => {
		it("change food unit", () => {
			const food = Food.create(foodId, {
				name: "dummy food name",
				expiry: expiry,
			}).value!;
			const changedFoodExpiry = Expiry.create({
				date: new Date(2023, 11, 2),
			}).value;
			food.changeExpiry(changedFoodExpiry);
			expect(food.expiry).toBe(changedFoodExpiry);
		});
	});
});
