import {describe, test, expect, Test} from "vitest"
import {Identifier} from "../../../src/Shared";
import {Ok, Result} from "../../../src/Shared";

/**
 * this is the concrete class for the test.
 * when the ID is string.
 */
class TestIdentifierString extends Identifier<string> {
    static create(id: string): Result<TestIdentifierString> {
        return Ok(new TestIdentifierString(id))
    }
}

/**
 * this is the concrete class for the test.
 * when the ID is number.
 */
class TestIdentifierNumber extends Identifier<number> {
    static create(id: number): Result<TestIdentifierNumber> {
        return Ok(new TestIdentifierNumber(id))
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
    static create(id: ITestIdentifier): Result<TestIdentifierObject> {
        const testIdentifier = new TestIdentifierObject(id);
        return Ok(testIdentifier);
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

    test("create instance", () => {

        expect(testId.ok).toBeTruthy();

        if (testId.ok) {
            const value = testId.value;
            expect(value.id).toBe("test");
        }
    })

    test("method", () => {
        const differentId = TestIdentifierString.create("bar");
        const sameId = TestIdentifierString.create("test");

        if (testId.ok && differentId.ok && sameId.ok) {
            expect(testId.value.equal(differentId.value)).toBeFalsy();
            expect(testId.value.equal(sameId.value)).toBeTruthy();
        } else {
            // if construct failed.
            expect(false).toBeTruthy();
        }

    })
})

describe("number ID", () => {

    const testId = TestIdentifierNumber.create(42);

    test("create number instance", () => {

        expect(testId.ok).toBeTruthy();

        if (testId.ok) {
            const value = testId.value;
            expect(value.id).toBe(42);
        }
    })

    test("number instance method", () => {
        const differentId = TestIdentifierNumber.create(24);
        const sameId = TestIdentifierNumber.create(42);

        if (testId.ok && differentId.ok && sameId.ok) {
            expect(testId.value.equal(differentId.value)).toBeFalsy();
            expect(testId.value.equal(sameId.value)).toBeTruthy();
        } else {
            // if construct failed.
            expect(false).toBeTruthy();
        }

    })
})
describe("Identifier object", () => {

    const testId = TestIdentifierObject.create(testParam);

    test("create object instance", () => {

        expect(testId.ok).toBeTruthy();

        // to access to value.
        if (testId.ok) {
            const value = testId.value;
            expect(value.id.String).toBe(testParam.String);
            expect(value.id.Number).toBe(testParam.Number);
            expect(value.id.Object.String).toBe(testParam.Object.String);
            expect(value.id.Object.Number).toBe(testParam.Object.Number);
            expect(value.id).toEqual(testParam);

        }
    })

    test("call object method", () => {
        // deep copy the "testParam"
        const modTestParam = JSON.parse(JSON.stringify(testParam))
        // modify the nested parameter
        modTestParam.Object.String = "bar";

        const differentId = TestIdentifierObject.create(modTestParam);
        const sameId = TestIdentifierObject.create(testParam);

        if (testId.ok && differentId.ok && sameId.ok) {
            expect(testId.value.equal(differentId.value)).toBeFalsy();
            expect(testId.value.equal(sameId.value)).toBeTruthy();
        } else {
            // if construct failed.
            expect(false).toBeTruthy();
        }
    })
})