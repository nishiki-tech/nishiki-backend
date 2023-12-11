import { describe, expect, it } from "vitest";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";

describe("Repository Error", () => {
	const repositoryError = new RepositoryError("Repository");

	it("The error message is empty on first time.", () => {
		expect(repositoryError.message).toBe("");
	});

	it("The error message is overwritten by the errorMessage method of the RepositoryError class.", () => {
		const newMessage = "new error message";
		repositoryError.errorMessage(newMessage, "report");
		expect(repositoryError.message).toBe(newMessage);
	});
});
