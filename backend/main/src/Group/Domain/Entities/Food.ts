import { Entity, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { Unit } from "../ValueObjects/Unit";
import { Quantity } from "src/Group/Domain/Quantity";
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

	public changeFoodName(newName: string): Result<Food, FoodDomainError> {
		const {name, ...nameExcludedProps} = this.props;
		return Food.create(this.id, {
			...nameExcludedProps,
			name: newName,
		});
	}

	public changeExpiry(newExpiry: Expiry): Result<Food, FoodDomainError> {
		const {expiry, ...expiryExcludedProps} = this.props;
		return Food.create(this.id, {
			...expiryExcludedProps,
			expiry: newExpiry,
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
