import { Identifier } from "src/Shared";

// biome-ignore lint/complexity/noStaticOnlyClass: test code
export class IdentificationTestClass extends Identifier<number> {
	static create(id: number): IdentificationTestClass {
		return new IdentificationTestClass(id);
	}
}
