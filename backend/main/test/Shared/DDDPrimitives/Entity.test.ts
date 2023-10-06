import { Entity } from "../../../src/Shared";
import {
    IdentificationTestClass,
    identificationTestData,
} from "../testData/identifierTestData"
import {describe, expect, test} from "vitest";

interface IEntityProps {
    "String": string
}

class EntityTestClass extends Entity<IdentificationTestClass, IEntityProps> {
    static create(id: IdentificationTestClass, props: IEntityProps): EntityTestClass {
        return new EntityTestClass(id, props);
    }
}

describe("abstract entity class", () => {
    const entityTestData = EntityTestClass.create(42, { "String": "test" });

    test("equal: same entity will be true", () => {
        expect(entityTestData.equals(entityTestData)).toBeTruthy();
    })

})
