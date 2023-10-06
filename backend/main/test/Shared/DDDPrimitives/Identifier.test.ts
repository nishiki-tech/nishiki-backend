import { describe, test, expect } from "vitest"
import { Identifier } from "../../../src/Shared";

/**
 * this is the concrete class for the test.
 * when the ID is string.
 */
class TestIdentifierString extends Identifier<string> {
    static create(id: string): TestIdentifierString {
        return new TestIdentifierString(id)
    }
}

/**
 * this is the concrete class for the test.
 * when the ID is number.
 */
class TestIdentifierNumber extends Identifier<number> {
    static create(id: number): TestIdentifierNumber {
        return new TestIdentifierNumber(id)
    }
}

interface INestedIdentifier {
    "String": string,
    "Number": number
}
interface ITestIdentifier {
    "String": string,
    "Number": number,
    "Object": INestedIdentifier
}

/**
 * this is the concrete class for the test.
 */
class TestIdentifierObject extends Identifier<ITestIdentifier> {
    static create(id: ITestIdentifier): TestIdentifierObject {
        return new TestIdentifierObject(id);
    }
}

const testParam: ITestIdentifier = {
    "String": "id",
    "Number": 42,
    "Object": {
        "String": "nestedId",
        "Number": 42
    }
}

describe("string ID", () => {

    const testId = TestIdentifierString.create("test");

    test("equal: same string ID is ture", () => {
        const sameId = TestIdentifierString.create("test");
        expect(testId.equal(sameId)).toBeTruthy();
    })

    test("equal: different string ID is false", () => {
        const differentId = TestIdentifierString.create("bar");
        expect(testId.equal(differentId)).toBeFalsy();
    })

})

describe("number ID", () => {

    const testId = TestIdentifierNumber.create(42);

    test("equal: same number ID is true", () => {
        const sameId = TestIdentifierNumber.create(42);
        expect(testId.equal(sameId)).toBeTruthy();
    })

    test("equal: different number ID is false", () => {
        const differentId = TestIdentifierNumber.create(24);
        expect(testId.equal(differentId)).toBeFalsy();
    })
})

describe("Identifier object ID", () => {

    const testId = TestIdentifierObject.create(testParam);

    test("id returns its ID object", () => {

        expect(testId.id.String).toBe(testParam.String);
        expect(testId.id.Number).toBe(testParam.Number);
        expect(testId.id.Object.String).toBe(testParam.Object.String);
        expect(testId.id.Object.Number).toBe(testParam.Object.Number);
        expect(testId.id).toEqual(testParam);
    })

    test("equal: same object ID is true", () => {
        const sameId = TestIdentifierObject.create(testParam);
        expect(testId.equal(sameId)).toBeTruthy();
    })

    test("equal: different object ID is false", () => {
        // deep copy the "testParam"
        const modTestParam = JSON.parse(JSON.stringify(testParam))
        // modify the nested parameter
        modTestParam.Object.String = "bar";

        const differentId = TestIdentifierObject.create(modTestParam);

        expect(testId.equal(differentId)).toBeFalsy();
    })
})