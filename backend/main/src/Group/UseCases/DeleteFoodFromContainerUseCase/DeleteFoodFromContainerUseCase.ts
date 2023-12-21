import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	DeleteFoodFromContainerUseCaseErrorType,
	IDeleteFoodFromContainerUseCase,
	ContainerIsNotExisting,
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/DeleteFoodFromContainerUseCase/IDeleteFoodFromContainerUseCase";
import { FoodId } from "src/Group/Domain/Entities/Food";
import { UserId } from "src/User";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";

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
	private readonly groupRepository: IGroupRepository;

	constructor(
		containerRepository: IContainerRepository,
		groupRepository: IGroupRepository,
	) {
		this.containerRepository = containerRepository;
		this.groupRepository = groupRepository;
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

		// check the user is the member of the group
		const group = await this.groupRepository.find(containerId);
		if (!group) {
			return Err(
				new GroupIsNotExisting("The requested group is not existing."),
			);
		}
		const userIdOrError = UserId.create(request.userId);
		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}
		const userId = userIdOrError.value;
		const canEdit = group.canEdit(userId);

		if (!canEdit) {
			return Err(
				new UserIsNotAuthorized(
					"The user is not authorized to access the container.",
				),
			);
		}
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
