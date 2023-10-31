import { Entity, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { Unit } from "../ValueObjects/Unit";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "../ValueObjects/Expiry";

interface IFoodProps {
	name: string;
	unit?: Unit;
	quantity?: Quantity;
	expiry?: Expiry;
}

export class Food extends Entity<string, IFoodProps> {
	// food name must be shorter than or equal 50.
	static create(id: FoodId, props: IFoodProps): Result<Food, FoodDomainError> {
		if (props.name.length > 50) {
			return Err(new FoodDomainError("Food name is too long"));
		}
		return Ok(
			new Food(id, {
				...props,
			}),
		);
	}

	get name(): string {
		return this.props.name;
	}

	get unit(): Unit | undefined {
		return this.props?.unit;
	}

	get quantity(): Quantity | undefined {
		return this.props?.quantity;
	}

	get expiry(): Expiry | undefined {
		return this.props?.expiry;
	}

	public changeName(name: string) {
		return Food.create(this.id, {
			...this.props,
			name: name,
		});
	}

	public changeExpiry(expiry: Expiry) {
		return Food.create(this.id, {
			...this.props,
			expiry: expiry,
		});
	}

	public changeUnit(unit: Unit) {
		return Food.create(this.id, {
			...this.props,
			unit: unit,
		});
	}

	public addQuantity(quantity: Quantity) {
		if (this.props.quantity === undefined) {
			return Food.create(this.id, {
				...this.props,
				quantity: quantity,
			});
		}
		const addedQuantity = this.props.quantity.add(quantity);

		return Food.create(this.id, {
			...this.props,
			quantity: addedQuantity,
		});
	}

	public subtractQuantity(quantity: Quantity): Result<Food, FoodDomainError> {
		if (this.props.quantity === undefined) {
			return Err(new FoodDomainError("Quantity is undefined"));
		}

		const subtractedQuantityOrError = this.props.quantity.subtract(quantity);
		if (!subtractedQuantityOrError.ok) {
			return Err(subtractedQuantityOrError.error);
		}

		const subtractedQuantity = subtractedQuantityOrError.value;

		return Food.create(this.id, {
			...this.props,
			quantity: subtractedQuantity,
		});
	}
}

export class FoodId extends Identifier<string> {
	static create(id: string): Result<FoodId, FoodIdDomainError> {
		return Ok(new FoodId(id));
	}
}

export class FoodIdDomainError extends DomainObjectError {}
export class FoodDomainError extends FoodIdDomainError {}
