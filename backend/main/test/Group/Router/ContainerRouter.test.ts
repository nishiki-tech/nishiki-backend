import { __local__ } from "src/Group/Router/ContainerRouter"
import { describe, it, expect, beforeEach } from "vitest";
const { isCorrectFoodBody } = __local__

describe("isCorrectFoodBody", () => {
    let body

    beforeEach(() => {
        body = {
            "name": "bouillon",
            "unit": "l",
            "category": "Vegetables",
            "quantity": 1.23,
            "expiry": "1970-01-01T00:00:00.000Z"
        }
    })

    describe("normal system", () => {
        it("when the body is filled, should return true", () => {
            const result = isCorrectFoodBody(body);

            expect(result.ok).toBeTruthy();

            const { value } = result;
            expect(value.name).toBe(body.name);
            expect(value.unit).toBe(body.unit);
            expect(value.category).toBe(body.category);
            expect(value.quantity).toBe(body.quantity);
            expect(value.expiry.toISOString()).toEqual(body.expiry);
        })
        it("unit can be null", () => {
            body.unit = null;

            const result = isCorrectFoodBody(body);

            expect(result.ok).toBeTruthy();
            expect(result.value.unit).toBeNull();
        })
        it("quantity can be null", () => {
            body.quantity = null;

            const result = isCorrectFoodBody(body);

            expect(result.ok).toBeTruthy();
            expect(result.value.quantity).toBeNull();
        })
        it("expiry can be null", () => {
            body.expiry = null;

            const result = isCorrectFoodBody(body);

            expect(result.ok).toBeTruthy();
            expect(result.value.expiry).toBeNull();
        })
    })

    describe("abnormal system", () => {
        it("body is not provided", () => {

            const result = isCorrectFoodBody(null);

            expect(result.err).toBeTruthy;
            expect(result.unwrapError()).toBe("Body cannot be null");
        })
        it("no food name", () => {
            body.name = null;

            const result = isCorrectFoodBody(body);

            expect(result.err).toBeTruthy;
            expect(result.unwrapError()).toBe("Enter the food name");
        })
        it("no category name", () => {
            body.category = null;

            const result = isCorrectFoodBody(body);

            expect(result.err).toBeTruthy;
            expect(result.unwrapError()).toBe("Category must be selected");
        })
        it("unit must be string", () => {
            body.unit = 42;

            const result = isCorrectFoodBody(body);

            expect(result.err).toBeTruthy;
            expect(result.unwrapError()).toBe("Unit must be string");
        })
        it("quantity must be number", () => {
            body.quantity = "42";

            const result = isCorrectFoodBody(body);

            expect(result.err).toBeTruthy;
            expect(result.unwrapError()).toBe("Quantity must be number");
        })
        it("expiry must be ISO Datetime string", () => {
            body.expiry = Date.now();

            const result = isCorrectFoodBody(body);

            expect(result.err).toBeTruthy;
            expect(result.unwrapError()).toBe("Expiry must be ISO Datetime string");
        })
    })
})
