import { Identifier } from "src/Shared";

export class IdentificationTestClass extends Identifier<number> {
    static create(id: number): IdentificationTestClass {
        return new IdentificationTestClass(id)
    }
}

/**
 * for test use, id 42
 */
export const identificationTestData = IdentificationTestClass.create(42);

/**
 * for test use, id 43
 */
export const identificationTestData2 = IdentificationTestClass.create(43);
