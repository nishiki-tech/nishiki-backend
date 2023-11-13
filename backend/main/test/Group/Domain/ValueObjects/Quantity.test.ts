import { describe, expect, it } from "vitest";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";

describe("Quantity Object", () => {
	describe("create a quantity object", () => {
		it("real number", () => {
			const REAL_NUMBER = 42;
			const quantity = Quantity.create(REAL_NUMBER);
			expect(quantity.ok).toBeTruthy();
			expect(quantity.unwrap().quantity).toBe(REAL_NUMBER);
		});

		it("zero", () => {
			const quantity = Quantity.create(0);
			expect(quantity.ok).toBeTruthy();
			expect(quantity.unwrap().quantity).toBe(0);
		});

		it("float", () => {
			const FLOAT_VALUE = 3.14;
			const quantity = Quantity.create(FLOAT_VALUE);
			expect(quantity.ok).toBeTruthy();
			expect(quantity.unwrap().quantity).toBe(FLOAT_VALUE);
		});

		it("effective digit is two. less than that is discarded.", () => {
			const FLOAT_VALUE = 3.141592;
			const quantity = Quantity.create(FLOAT_VALUE);
			expect(quantity.ok).toBeTruthy();
			expect(quantity.unwrap().quantity).toBe(3.14);
		});

		it("minus", () => {
			const quantity = Quantity.create(-1);
			expect(quantity.ok).toBeFalsy();
		});
	});

	describe("add a quantity", () => {
		const quantity = Quantity.create(42).unwrap();

		it("add a number", () => {
			const addedQuantity = Quantity.create(42).unwrap();
			const result = quantity.add(addedQuantity);
			expect(result.quantity).toBe(42 + 42);
		});
	});

	describe("subtract a quantity", () => {
		const quantity = Quantity.create(42).unwrap();

		it("less than origin", () => {
			const subtractedQuantity = Quantity.create(1).unwrap();
			const result = quantity.subtract(subtractedQuantity);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap().quantity).toBe(42 - 1);
		});

		it("equal", () => {
			const subtractedQuantity = Quantity.create(42).unwrap();
			const result = quantity.subtract(subtractedQuantity);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap().quantity).toBe(0);
		});

		it("grater than origin", () => {
			const subtractedQuantity = Quantity.create(43).unwrap();
			const result = quantity.subtract(subtractedQuantity);
			expect(result.ok).toBeFalsy();
		});

		it("float", () => {
			const subtractedQuantity = Quantity.create(0.1).unwrap();
			const result = quantity.subtract(subtractedQuantity);
			expect(result.ok).toBeTruthy();
			expect(result.unwrap().quantity).toBe(41.9);
		});
	});
});
