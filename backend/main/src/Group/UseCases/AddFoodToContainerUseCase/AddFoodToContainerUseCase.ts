import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	AddFoodToContainerUseCaseErrorType,
	IAddFoodToContainerUseCase,
	ContainerIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/AddFoodToContainerUseCase/IAddFoodToContainerUseCase";
import { Food, FoodId, IFoodProps } from "src/Group/Domain/Entities/Food";
import { Unit } from "src/Group/Domain/ValueObjects/Unit";
import { Quantity } from "src/Group/Domain/ValueObjects/Quantity";
import { Expiry } from "src/Group/Domain/ValueObjects/Expiry";
import { UserId } from "src/User";

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
	private readonly groupRepository: IGroupRepository;

	constructor(
		containerRepository: IContainerRepository,
		groupRepository: IGroupRepository,
	) {
		this.containerRepository = containerRepository;
		this.groupRepository = groupRepository;
	}

	public async execute(
		request: IAddFoodToContainerUseCase,
	): Promise<Result<undefined, AddFoodToContainerUseCaseErrorType>> {
		const foodProps: IFoodPropsWithoutCreatedAt = {
			name: request.name,
			category: request.category,
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

		const foodOrError = Food.generateFoodWithCreatedAt(foodProps);
		if (!foodOrError.ok) {
			return Err(foodOrError.error);
		}
		const food = foodOrError.value;

		const containerIdOrError = ContainerId.create(request.containerId);
		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}
		const containerId = containerIdOrError.value;

		const [group, container] = await Promise.all([
			this.groupRepository.find(containerId),
			this.containerRepository.find(containerId),
		]);

		if (!container || !group) {
			return Err(
				new ContainerIsNotExisting("The requested container is not existing."),
			);
		}

		// check the user is the member of the group
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

		const newContainerOrError = container?.addFood(food);
		if (!newContainerOrError.ok) {
			return Err(newContainerOrError.error);
		}
		const newContainer = newContainerOrError.value;

		await this.containerRepository.update(newContainer);

		return Ok(undefined);
	}
}
