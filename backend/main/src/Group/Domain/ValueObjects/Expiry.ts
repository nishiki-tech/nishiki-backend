import { Err, Ok, Result, ValueObject } from "src/Shared";
import { DomainObjectError } from "src/Shared";

interface IExpiryProps {
	date: Date;
}

/**
 * This class is Expiry class.
 * The expiry date must be after 1970-01-01.
 */
export class Expiry extends ValueObject<IExpiryProps> {
	static create(props: IExpiryProps): Result<Expiry, ExpiryDomainError> {
		const minDate = new Date(1970, 1, 1);
		if (props.date <= minDate) {
			return Err(new ExpiryDomainError("Expiry date is too old"));
		}
		return Ok(new Expiry(props));
	}

	get date(): Date {
		return this.props.date;
	}

	/**
	 * Check if the expiry date is before today.
	 * @returns true if the expiry date is before today.
	 */
	public isExpired(): boolean {
		return this.date < new Date();
	}
}

export class ExpiryDomainError extends DomainObjectError {}
