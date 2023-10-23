import { Err, Ok, Result, ValueObject } from "src/Shared";
import { DomainObjectError } from "src/Shared";

interface IUnitProps {
	name: string;
}

export class Unit extends ValueObject<IUnitProps> {
	private constructor(props: IUnitProps) {
		super(props);
	}

	// unit name must be shorter than 50.
	static create(name: string): Result<Unit, UnitDomainError> {
		if (name.length > 50) {
			return Err(new UnitDomainError("Unit name is too long"));
		}
		return Ok(
			new Unit({
				name,
			}),
		);
	}

	get name(): string {
		return this.props.name;
	}
}

export class UnitDomainError extends DomainObjectError {}
