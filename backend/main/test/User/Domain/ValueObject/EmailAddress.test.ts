import { describe, expect, it } from "vitest";
import {
	EmailAddress,
	EmailAddressError,
} from "../../../../src/User/Domain/ValueObject/EmailAddress";

describe("EmailAddress", () => {
	describe("create", () => {
		it("correct address", () => {
			const EMAIL_ADDRESS = "bar.foo@nishiki.com";
			const emailAddress = EmailAddress.create(EMAIL_ADDRESS);

			expect(emailAddress.ok).toBeTruthy();
			expect(emailAddress.value.emailAddress).toBe(EMAIL_ADDRESS);
		});

		it("incorrect address", () => {
			const emailAddress = EmailAddress.create("bar.foo_at_nishili.com");
			expect(emailAddress.ok).toBeFalsy();
			expect(emailAddress.error).toBeInstanceOf(EmailAddressError);
		});
	});
});
