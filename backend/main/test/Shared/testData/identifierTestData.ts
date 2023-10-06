import { Identifier } from "src/Shared";

export class IdentificationTestClass extends Identifier<number> {
    static create(id: number): IdentificationTestClass {
        return new IdentificationTestClass(id)
    }
}