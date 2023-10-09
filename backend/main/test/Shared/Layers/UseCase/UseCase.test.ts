import {DomainObjectError, UseCaseError} from "../../../../src/Shared/Layers/UseCase/UseCase";
import {describe, expect, it} from "vitest";

class DomainError extends DomainObjectError{}
class TestUseCaseError extends UseCaseError{}

describe("Use case errors", () => {

	const DOMAIN_ERROR_MESSAGE = "DOMAIN ERROR";
	const TEST_USE_CASE_ERROR_MESSAGE = "TEST USE CASE ERROR";

	const domainError = new DomainError(DOMAIN_ERROR_MESSAGE);
	const testUseCaseError = new TestUseCaseError(TEST_USE_CASE_ERROR_MESSAGE);

	it("check instance", () => {
		expect(domainError instanceof DomainObjectError).toBeTruthy();
		expect(testUseCaseError instanceof UseCaseError).toBeTruthy();

		// those errors are inherited from the Error class.
		expect(domainError instanceof Error).toBeTruthy();
		expect(testUseCaseError instanceof Error).toBeTruthy();
	})

	it("these errors can be distinguished from each other", () => {
			expect(domainError instanceof UseCaseError).toBeFalsy();
			expect(testUseCaseError instanceof DomainObjectError).toBeFalsy();
	})

	it("can access to message", () => {
			expect(domainError.message).toBe(DOMAIN_ERROR_MESSAGE);
			expect(testUseCaseError.message).toBe(TEST_USE_CASE_ERROR_MESSAGE);
	})
})