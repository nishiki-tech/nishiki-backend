import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	UpdateFoodOfContainerUseCaseErrorType,
	IUpdateFoodOfContainerUseCase,
	ContainerIsNotExisting,
	UserIsNotAuthorized,
	GroupIsNotExisting,
} from "src/Group/UseCases/UpdateFoodOfContainerUseCase/IUpdateFoodOfContainerUseCase";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { UserId } from "src/User";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Food, FoodId, IFoodProps } from "src/Group/Domain/Entities/Food";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";

/**
 * Update Food of a container.
 */
export class UpdateFoodOfContainerUseCase
	implements
		IUseCase<
			IUpdateFoodOfContainerUseCase,
			undefined,
			UpdateFoodOfContainerUseCaseErrorType
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
		request: IUpdateFoodOfContainerUseCase,
	): Promise<Result<undefined, UpdateFoodOfContainerUseCaseErrorType>> {
		const { userId, containerId, foodId, name, unit, quantity, expiry } =
			request;
		const containerIdOrError = ContainerId.create(containerId);
		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}
		const containerIdValue = containerIdOrError.value;

		// check the user is the member of the group
		const group = await this.groupRepository.find(containerIdValue);
		if (!group) {
			return Err(
				new GroupIsNotExisting("The requested group is not existing."),
			);
		}
		const userIdOrError = UserId.create(userId);
		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}
		const userIdValue = userIdOrError.value;
		const canEdit = group.canEdit(userIdValue);

		if (!canEdit) {
			return Err(
				new UserIsNotAuthorized(
					"The user is not authorized to access the container.",
				),
			);
		}

		const foodProps: IFoodProps = {
			name: name,
		};

		if (quantity) {
			const quantityOrError = Quantity.create(quantity);
			if (!quantityOrError.ok) {
				return Err(quantityOrError.error);
			}
			foodProps.quantity = quantityOrError.value;
		}
		if (expiry) {
			const expiryOrError = Expiry.create({ date: expiry });
			if (!expiryOrError.ok) {
				return Err(expiryOrError.error);
			}
			foodProps.expiry = expiryOrError.value;
		}
		if (unit) {
			const unitOrError = Unit.create({ name: unit });
			if (!unitOrError.ok) {
				return Err(unitOrError.error);
			}
			foodProps.unit = unitOrError.value;
		}
		const foodIdOrError = FoodId.create(foodId);
		if (!foodIdOrError.ok) {
			return Err(foodIdOrError.error);
		}
		const foodIdValue = foodIdOrError.value;
		const foodOrError = Food.create(foodIdValue, foodProps);
		if (!foodOrError.ok) {
			return Err(foodOrError.error);
		}
		const food = foodOrError.value;

		const container = await this.containerRepository.find(containerIdValue);
		if (!container) {
			return Err(
				new ContainerIsNotExisting("The requested container is not existing."),
			);
		}
		const newContainerOrError = container.updateFood(food);
		if (!newContainerOrError.ok) {
			return Err(newContainerOrError.error);
		}
		const newContainer = newContainerOrError.value;

		await this.containerRepository.update(newContainer);

		return Ok(undefined);
	}
}
