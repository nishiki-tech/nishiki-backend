import { describe, expect, it } from "vitest";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";

describe("Repository Error", () => {
	class TestRepositoryError extends RepositoryError {
		constructor(message: string, report: string | string[]) {
			super("TestRepository", message, report);
		}
	}

	const ERROR_MESSAGE = "error message";

	const repositoryError = new TestRepositoryError(ERROR_MESSAGE, [
		"error",
		"error2",
	]);

	it("check error message", () => {
		expect(repositoryError.message).toBe(ERROR_MESSAGE);
	});

	it("check report", () => {
		// biome-ignore lint/complexity/useLiteralKeys: to access to private field for this test
		expect(repositoryError["report"]).toBeInstanceOf(Array);
		// biome-ignore lint/complexity/useLiteralKeys: to access to private field for this test
		expect(repositoryError["report"]).toEqual(["error", "error2"]);
	});
});
