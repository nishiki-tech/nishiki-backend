import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	DeleteFoodFromContainerUseCaseErrorType,
	IDeleteFoodFromContainerUseCase,
	ContainerIsNotExisting,
} from "src/Group/UseCases/DeleteFoodFromContainerUseCase/IDeleteFoodFromContainerUseCase";
import { FoodId } from "src/Group/Domain/Entities/Food";

/**
 * delete a Food from a container.
 */
export class DeleteFoodFromContainerUseCase
	implements
		IUseCase<
			IDeleteFoodFromContainerUseCase,
			undefined,
			DeleteFoodFromContainerUseCaseErrorType
		>
{
	private readonly containerRepository: IContainerRepository;

	constructor(containerRepository: IContainerRepository) {
		this.containerRepository = containerRepository;
	}

	public async execute(
		request: IDeleteFoodFromContainerUseCase,
	): Promise<Result<undefined, DeleteFoodFromContainerUseCaseErrorType>> {
		const foodIdOrError = FoodId.create(request.foodId);
		if (!foodIdOrError.ok) {
			return Err(foodIdOrError.error);
		}
		const foodId = foodIdOrError.value;

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

		const newContainerOrError = container.removeFood(foodId);
		if (!newContainerOrError.ok) {
			return Err(newContainerOrError.error);
		}
		const newContainer = newContainerOrError.value;

		await this.containerRepository.update(newContainer);

		return Ok(undefined);
	}
}
