import { ValueObject } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";

interface IUnitProps {
	name: string;
}

/**
 * This class is user class.
 * The name of unit must be less than equal to 10.
 */
export class Unit extends ValueObject<IUnitProps> {
	static create(props: IUnitProps): Result<Unit, UnitDomainError> {
		if (props.name.length > 20) {
			return Err(new UnitDomainError("Unit name is too long"));
		}
		return Ok(new Unit(props));
	}

	get name(): string {
		return this.props.name;
	}
}

export class UnitDomainError extends DomainObjectError {}
