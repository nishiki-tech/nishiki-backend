import { Entity } from "src/Shared";
import { IdentificationTestClass } from "../testData/identifierTestData";
import { describe, expect, test } from "vitest";

interface IEntityProps {
	String: string;
}

class EntityTestClass extends Entity<number, IEntityProps> {
	static create(
		id: IdentificationTestClass,
		props: IEntityProps,
	): EntityTestClass {
		return new EntityTestClass(id, props);
	}
}

describe("abstract entity class", () => {
	const id = IdentificationTestClass.create(42)
	const entityTestData = EntityTestClass.create(id, { String: "test" });

	test("equal: same entity will be true", () => {
		expect(entityTestData.equals(entityTestData)).toBeTruthy();
	});
});
