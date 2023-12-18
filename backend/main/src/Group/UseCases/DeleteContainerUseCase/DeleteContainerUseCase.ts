import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	DeleteContainerUseCaseErrorType,
	IDeleteContainerUseCase,
	UserIsNotAuthorized,
	GroupIsNotExisting,
} from "src/Group/UseCases/DeleteContainerUseCase/IDeleteContainerUseCase";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { UserId } from "src/User";

/**
 * Deletion operation skips conforming to container existence.
 */
export class DeleteContainerUseCase
	implements
		IUseCase<
			IDeleteContainerUseCase,
			undefined,
			DeleteContainerUseCaseErrorType
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
		request: IDeleteContainerUseCase,
	): Promise<Result<undefined, DeleteContainerUseCaseErrorType>> {
		const containerIdOrError = ContainerId.create(request.containerId);

		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}

		const containerId = containerIdOrError.value;

		// check the user is the member of the group
		const group = await this.groupRepository.findByContainerId(containerId);
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
					"The user is not authorized to a ccess the container.",
				),
			);
		}

		await this.containerRepository.delete(containerId);

		const newGroupOrError = group.removeContainerId(containerId);
		if (!newGroupOrError.ok) {
			return Err(newGroupOrError.error);
		}
		const newGroup = newGroupOrError.value;
		await this.groupRepository.update(newGroup);

		return Ok(undefined);
	}
}
