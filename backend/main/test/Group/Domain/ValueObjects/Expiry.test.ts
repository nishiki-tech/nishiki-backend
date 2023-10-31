import { describe, expect, it } from "vitest";
import { Expiry, ExpiryDomainError } from "../../../../src/Group/Domain/ValueObjects/Expiry";

describe("Expiry Object", () => {
	describe("creating expiry", () => {
		it("success", () => {
			const nowDate = new Date();

			const expiry = Expiry.create({
				date: nowDate,
			});

			expect(expiry.ok).toBeTruthy();
			expect(expiry.value!.date).toBe(nowDate);
		});

		it("expiry date too old", () => {
			const oldDate = new Date(1969, 12, 31);
			const expiry = Expiry.create({
				date: oldDate,
			});

			expect(expiry.ok).toBeFalsy();
			expect(expiry.error).toBeInstanceOf(ExpiryDomainError);
		});
	});
});
