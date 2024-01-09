import { describe, expect, it } from "vitest";
import { Food, FoodDomainError, FoodId } from "src/Group/Domain/Entities/Food";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";
import { v4 as uuidv4 } from "uuid";

describe("Food ID", () => {
	it("correct ID", () => {
		const correctId = uuidv4();
		const foodId = FoodId.create(correctId);
		expect(foodId.ok).toBeTruthy();
		expect(foodId.unwrap().id).toBe(correctId);
	});

	it("incorrect uuid", () => {
		const writtenByHand = "aaaaaaaa-1111-1111-1111-111111111111";
		expect(FoodId.create(writtenByHand).ok).toBeFalsy();
	});
});

describe("Food Entity", () => {
	const unit = Unit.create({ name: "g" }).unwrap();
	const quantity = Quantity.create(1).unwrap();
	const expiry = Expiry.create({ date: new Date(2023, 11, 1) }).unwrap();
	const foodId = FoodId.generate();
	const category = "dummy category";

	const requiredFoodProps = {
		name: "dummy food name",
		category: category,
		createdAt: new Date(),
	};
	const fullFoodProps = {
		...requiredFoodProps,
		unit: unit,
		quantity: quantity,
		expiry: expiry,
	};

	describe("Food Object generate method", () => {
		it("success with required food props", () => {
			const food = Food.generateFoodWithCreatedAt({
				name: "dummy food name",
				category: category,
			});
			expect(food.ok).toBeTruthy();
			expect(food.unwrap().name).toBe("dummy food name");
			expect(food.unwrap().createdAt).toBeDefined();
		});
	});

	describe("Construct Food Object", () => {
		it("success with full food props", () => {
			const food = Food.create(foodId, fullFoodProps);
			expect(food.ok).toBeTruthy();
			expect(food.unwrap().name).toBe(fullFoodProps.name);
		});

		it("success with required food props", () => {
			const food = Food.create(foodId, requiredFoodProps);
			expect(food.ok).toBeTruthy();
			expect(food.unwrap().name).toBe(fullFoodProps.name);
			expect(food.unwrap().expiry).toBeUndefined();
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
		const foodWithRequiredProps = Food.create(
			foodId,
			requiredFoodProps,
		).unwrap();
		const foodWithFullProps = Food.create(foodId, fullFoodProps).unwrap();

		describe("change food name", () => {
			it("change user name", () => {
				const changedFoodName = "changedFoodName";
				const changedFood = foodWithFullProps
					.changeName(changedFoodName)
					.unwrap();
				expect(changedFood.name).toBe(changedFoodName);
			});
		});

		describe("change food unit", () => {
			it("change food unit", () => {
				const changedFoodUnit = Unit.create({ name: "Liter" }).unwrap();
				const changedFood = foodWithFullProps
					.changeUnit(changedFoodUnit)
					.unwrap();
				expect(changedFood.unit).toMatchObject(changedFoodUnit);
			});
		});

		describe("change food quantity", () => {
			it("add food quantity", () => {
				const changedFoodQuantity = Quantity.create(200).unwrap();
				const expectedFoodQuantity = Quantity.create(201).unwrap();

				const changedFood = foodWithFullProps
					.addQuantity(changedFoodQuantity)
					.unwrap();
				expect(changedFood.quantity).toMatchObject(expectedFoodQuantity);
			});
			it("subtract food quantity", () => {
				const changedFoodQuantity = Quantity.create(1).unwrap();
				const expectedFoodQuantity = Quantity.create(0).unwrap();

				const changedFood = foodWithFullProps
					.subtractQuantity(changedFoodQuantity)
					.unwrap();
				expect(changedFood.quantity).toMatchObject(expectedFoodQuantity);
			});
			it("subtract food quantity when it's going to be minus", () => {
				const changedFoodQuantity = Quantity.create(2).unwrap();

				const changedFood =
					foodWithRequiredProps.subtractQuantity(changedFoodQuantity);
				expect(changedFood.unwrapError()).instanceOf(FoodDomainError);
			});
		});

		it("add food quantity when it's undefined", () => {
			const changedFoodQuantity = Quantity.create(200).unwrap();
			const expectedFoodQuantity = Quantity.create(200).unwrap();

			const changedFood = foodWithRequiredProps
				.addQuantity(changedFoodQuantity)
				.unwrap();
			expect(changedFood.quantity).toMatchObject(expectedFoodQuantity);
		});
		it("subtract food quantity when it's undefined", () => {
			const changedFoodQuantity = Quantity.create(1).unwrap();

			const changedFood =
				foodWithRequiredProps.subtractQuantity(changedFoodQuantity);
			expect(changedFood.unwrapError()).instanceOf(FoodDomainError);
		});

		describe("change food expiry", () => {
			it("change food unit", () => {
				const changedFoodExpiry = Expiry.create({
					date: new Date(2023, 11, 2),
				}).unwrap();
				const changedFood = foodWithFullProps
					.changeExpiry(changedFoodExpiry)
					.unwrap();
				expect(changedFood.expiry).toMatchObject(changedFoodExpiry);
			});
		});
	});
});
