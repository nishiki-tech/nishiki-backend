import { DomainObjectError, ValueObject } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";

/**
 * Quantity class.
 */
export class Quantity extends ValueObject<{ quantity: number }> {
	get quantity(): number {
		return this.props.quantity;
	}

	/**
	 * add quantity
	 * @param quantity
	 */
	public add(quantity: Quantity): Quantity {
		const addedQuantity = this.props.quantity + quantity.props.quantity;
		return new Quantity({ quantity: addedQuantity });
	}

	/**
	 * subtract quantity
	 * @param quantity
	 */
	public subtract(quantity: Quantity): Result<Quantity, QuantityError> {
		const subtractedQuantity = this.props.quantity - quantity.props.quantity;
		return Quantity.create(subtractedQuantity);
	}

	/**
	 * Create a quantity instance.
	 * The quantity must be grater than equal 0.
	 * The quantity is decimal, the less than 3 digit is discarded.
	 * @param quantity
	 */
	static create(quantity: number): Result<Quantity, QuantityError> {
		if (quantity < 0) {
			return Err(
				new QuantityError(
					`The quantity must be grater than 0. The input is ${quantity}.`,
				),
			);
		}

		if (Number.isInteger(quantity)) {
			return Ok(new Quantity({ quantity }));
		}

		const discardedDecimal = Math.floor(quantity * 100) / 100;
		return Ok(new Quantity({ quantity: discardedDecimal }));
	}
}

export class QuantityError extends DomainObjectError {}
