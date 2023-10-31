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
/**
 * This class is food class.
 * The name of food must be shorter than equal to 30 and greater than equal 1.
 */
export class Food extends Entity<string, IFoodProps> {
	// food name must be shorter than or equal 30.
	static create(id: FoodId, props: IFoodProps): Result<Food, FoodDomainError> {
		if (props.name.length < 1) {
			return Err(new FoodDomainError("Food name is too short"));
		}
		if (props.name.length > 30) {
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

	/**
	 * change food's name.
	 * @param name
	 * @return Food
	 */
	public changeName(name: string): Result<Food, FoodDomainError> {
		return Food.create(this.id, {
			...this.props,
			name: name,
		});
	}

	/**
	 * change food's expiry.
	 * @param expiry
	 * @return Food
	 */
	public changeExpiry(expiry: Expiry): Result<Food, FoodDomainError> {
		return Food.create(this.id, {
			...this.props,
			expiry: expiry,
		});
	}

	/**
	 * change food's unit.
	 * @param unit
	 * @return Food
	 */
	public changeUnit(unit: Unit): Result<Food, FoodDomainError> {
		return Food.create(this.id, {
			...this.props,
			unit: unit,
		});
	}

	/**
	 * add food's quantity.
	 * @param quantity
	 * @return Food
	 */
	public addQuantity(quantity: Quantity): Result<Food, FoodDomainError> {
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

	/**
	 * subtract food's quantity.
	 * @param quantity
	 * @return Food
	 */
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

/**
 * This class is the food's ID.
 */
export class FoodId extends Identifier<string> {
	static create(id?: string): Result<FoodId, FoodIdDomainError> {
		if (id) {
			return Ok(new FoodId(id));
		}
		// todo: generate uuid
		const foodId = "dummy-food-id";
		return Ok(new FoodId(foodId));
	}
}

export class FoodIdDomainError extends DomainObjectError {}
export class FoodDomainError extends FoodIdDomainError {}
