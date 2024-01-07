import { describe, expect, it } from "vitest";
import { isValidUUIDV4, isMd5 } from "src/Shared/Utils/Validator";
import { v1, v4 } from "uuid";
import Md5 from "crypto-js/md5";

describe("UUID V4 validator", () => {
	it("uuid v4, constant", () => {
		const correctUUIDV4 = "c5e80bd4-0ece-4866-be93-41e8916cbf47";
		expect(isValidUUIDV4(correctUUIDV4)).toBeTruthy();
	});

	it("uuid v4, generated", () => {
		expect(isValidUUIDV4(v4())).toBeTruthy();
	});

	it("uuid v1, constant", () => {
		const UUIDV1 = "edcb9e9e-9fab-11ee-8c90-0242ac120002";
		expect(isValidUUIDV4(UUIDV1)).toBeFalsy();
	});

	it("uuid v1, constant", () => {
		expect(isValidUUIDV4(v1())).toBeFalsy();
	});

	it("string", () => {
		expect(isValidUUIDV4("I'm UUID V4! It's true! Believe me!")).toBeFalsy();
	});
});

describe("MD5 validator", () => {
	it("correct ID is provided", () => {
		const correctID = Md5("to-be-correct-MD5").toString();
		expect(isMd5(correctID)).toBeTruthy();
	});
	it("incorrect ID is provided", () => {
		const incorrectID = "incorrect-ID";
		expect(isMd5(incorrectID)).toBeFalsy();
	})
})
