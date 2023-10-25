import { Err, Ok, Result, ValueObject } from "src/Shared";
import { DomainObjectError } from "src/Shared";

interface IUnitProps {
	name: string;
}

/**
 * This class is user class.
 * The name of unit must be less than equal to 10.
 */
export class Unit extends ValueObject<IUnitProps> {
	private constructor(props: IUnitProps) {
		super(props);
	}

	static create(props: IUnitProps): Result<Unit, UnitDomainError> {
		if (props.name.length > 10) {
			return Err(new UnitDomainError("Unit name is too long"));
		}
		return Ok(new Unit(props));
	}

	get name(): string {
		return this.props.name;
	}
}

export class UnitDomainError extends DomainObjectError {}
