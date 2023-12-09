import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	AddFoodToContainerUseCaseErrorType,
	IAddFoodToContainerUseCase,
	ContainerIsNotExisting,
} from "src/Group/UseCases/AddFoodToContainerUseCase/IAddFoodToContainerUseCase";
import { Food, FoodId, IFoodProps } from "src/Group/Domain/Entities/Food";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";

/**
 * Add a Food to a container.
 */
export class AddFoodToContainerUseCase
	implements
		IUseCase<
			IAddFoodToContainerUseCase,
			undefined,
			AddFoodToContainerUseCaseErrorType
		>
{
	private readonly containerRepository: IContainerRepository;

	constructor(containerRepository: IContainerRepository) {
		this.containerRepository = containerRepository;
	}

	public async execute(
		request: IAddFoodToContainerUseCase,
	): Promise<Result<undefined, AddFoodToContainerUseCaseErrorType>> {
		const foodIdOrError = FoodId.create();
		if (!foodIdOrError.ok) {
			return Err(foodIdOrError.error);
		}
		const foodId = foodIdOrError.value;

		const foodProps: IFoodProps = {
			name: request.name,
		};

		if (request.unit) {
			const unitOrError = Unit.create({ name: request.unit });
			if (!unitOrError.ok) {
				return Err(unitOrError.error);
			}
			foodProps.unit = unitOrError.value;
		}
		if (request.quantity) {
			const quantityOrError = Quantity.create(request.quantity);
			if (!quantityOrError.ok) {
				return Err(quantityOrError.error);
			}
			foodProps.quantity = quantityOrError.value;
		}
		if (request.expiry) {
			const expiryOrError = Expiry.create({ date: request.expiry });
			if (!expiryOrError.ok) {
				return Err(expiryOrError.error);
			}
			foodProps.expiry = expiryOrError.value;
		}

		const foodOrError = Food.create(foodId, foodProps);
		if (!foodOrError.ok) {
			return Err(foodOrError.error);
		}
		const food = foodOrError.value;

		const containerIdOrError = ContainerId.create(request.containerId);
		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}
		const containerId = containerIdOrError.value;

		const container = await this.containerRepository.find(containerId);
		if (!container) {
			return Err(
				new ContainerIsNotExisting("The requested container is not existing."),
			);
		}

		const newContainerOrError = container?.addFood(food);
		if (!newContainerOrError.ok) {
			return Err(newContainerOrError.error);
		}
		const newContainer = newContainerOrError.value;

		await this.containerRepository.update(newContainer);

		return Ok(undefined);
	}
}
