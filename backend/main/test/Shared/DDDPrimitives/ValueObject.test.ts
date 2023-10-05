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
    static create(props: ITestValue): Result<TestValueObject> {
        return Ok(new TestValueObject(props))
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

    it("construct", () => {
        expect(testValueObject).toBeTruthy();
    });

    it("equal", () => {
        const modValueObjectProps = JSON.parse(JSON.stringify(valueObjectProps));
        modValueObjectProps.Nest.String = "tset"

        const sameValue = TestValueObject.create(valueObjectProps);
        const differentValue = TestValueObject.create(modValueObjectProps);

        if (testValueObject.ok && sameValue.ok && differentValue.ok) {
            expect(testValueObject.value.equal(sameValue.value)).toBeTruthy();
            expect(testValueObject.value.equal(differentValue.value)).toBeFalsy();
        } else {
            expect(false).toBeTruthy();
        }

    })
})
