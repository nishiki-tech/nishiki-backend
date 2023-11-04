import { Food, FoodId } from "src/Group/Domain/Entities/Food";
import { AggregateRoot, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";

interface IContainerProps {
	name: string;
	foods: Food[];
}

/**
 * This class is container class.
 * The name of container must be shorter than equal to 50 and greater than equal 1.
 */
export class Container extends AggregateRoot<string, IContainerProps> {
	static create(
		id: ContainerId,
		props: IContainerProps,
	): Result<Container, ContainerDomainError> {
		if (props.name.length < 1) {
			return Err(new ContainerDomainError("Container name is too short"));
		}
		if (props.name.length > 255) {
			return Err(new ContainerDomainError("Container name is too long"));
		}
		return Ok(
			new Container(id, {
				...props,
			}),
		);
	}

	get name(): string {
		return this.props.name;
	}

	get foods(): Food[] {
		return this.props.foods;
	}

	/**
	 * Change the name of container.
	 * @param name
	 */
	public changeName(name: string): Result<Container, ContainerDomainError> {
		return Container.create(this.id, {
			...this.props,
			name: name,
		});
	}

	/**
	 * Add food object to the container.
	 * @param food
	 */
	public addFood(food: Food): Result<Container, ContainerDomainError> {
		// find if the food object is already exist in the container.
		const matchedFood = this.props.foods.find((f) => f.id === food.id);
		if (matchedFood !== undefined) {
			return Err(
				new ContainerDomainError(
					"The food object already exists in the container",
				),
			);
		}

		const foods = [...this.props.foods, food];
		return Container.create(this.id, {
			...this.props,
			foods: foods,
		});
	}

	/**
	 * Remove food object from the container.
	 * @param food
	 */
	public removeFood(foodId: FoodId): Result<Container, ContainerDomainError> {
		const foods = this.props.foods.filter((f) => f.id !== foodId);
		if (foods.length === this.props.foods.length) {
			return Err(
				new ContainerDomainError(
					"The food object doesn't exist in the container",
				),
			);
		}

		return Container.create(this.id, {
			...this.props,
			foods: foods,
		});
	}
}

/**
 * This class is the container's ID.
 */
export class ContainerId extends Identifier<string> {
	static create(id?: string): Result<ContainerId, ContainerIdDomainError> {
		if (id) {
			return Ok(new ContainerId(id));
		}
		// todo: generate uuid
		const containerId = "dummy-container-id";
		return Ok(new ContainerId(containerId));
	}
}

export class ContainerIdDomainError extends DomainObjectError {}
export class ContainerDomainError extends ContainerIdDomainError {}
