import {describe, expect, it} from "vitest";
import {isValidUUIDV4} from "src/Shared/Utils/Validator";
import { v1, v4 } from "uuid"

describe("UUID V4 validator", () => {

    it('uuid v4, constant', () => {
        const correctUUIDV4 = "c5e80bd4-0ece-4866-be93-41e8916cbf47";
        expect(isValidUUIDV4(correctUUIDV4)).toBeTruthy();
    });

    it('uuid v4, generated', () => {
       expect(isValidUUIDV4(v4())).toBeTruthy();
    })

    it('uuid v1, constant', () => {
        const UUIDV1 = "edcb9e9e-9fab-11ee-8c90-0242ac120002";
        expect(isValidUUIDV4(UUIDV1)).toBeFalsy();
    })

    it('uuid v1, constant', () => {
        expect(isValidUUIDV4(v1())).toBeFalsy();
    })

    it("string", () => {
        expect(isValidUUIDV4("I'm UUID V4! It's true! Believe me!")).toBeFalsy();
    })
})