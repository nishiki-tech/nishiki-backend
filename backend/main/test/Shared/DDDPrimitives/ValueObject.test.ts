import { describe, expect, it } from "vitest";
import { Ok, Result, ValueObject } from "../../../src/Shared";

interface ITestValue {
    "String": string,
    "Number": number
    "Nest": {
        "String": string,
        "Number": number
    }
}

class TestValueObject extends ValueObject<ITestValue> {
    static create(props: ITestValue): TestValueObject {
        return new TestValueObject(props)
    }
}

describe("Value object primitive", () => {

    const valueObjectProps: ITestValue = {
        "String": "test",
        "Number": 42,
        "Nest": {
            "String": "test2",
            "Number": 24
        }
    };

    const testValueObject = TestValueObject.create(valueObjectProps);

    it("equal: same value object", () => {
        const sameValue = TestValueObject.create(valueObjectProps);
        expect(testValueObject.equal(sameValue)).toBeTruthy();
    })

    it("equal: different value object", () => {
        const modValueObjectProps = JSON.parse(JSON.stringify(valueObjectProps));
        modValueObjectProps.Nest.String = "tset";

        const differentValue = TestValueObject.create(modValueObjectProps);
        expect(testValueObject.equal(differentValue)).toBeFalsy();
    })
})
