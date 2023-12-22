import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	UpdateContainerNameUseCaseErrorType,
	IUpdateContainerNameUseCase,
	ContainerIsNotExisting,
	UserIsNotAuthorized,
	GroupIsNotExisting,
} from "src/Group/UseCases/UpdateContainerNameUseCase/IUpdateContainerNameUseCase";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { UserId } from "src/User";

/**
 * Deletion operation skips conforming to container existence.
 */
export class UpdateContainerNameUseCase
	implements
		IUseCase<
			IUpdateContainerNameUseCase,
			undefined,
			UpdateContainerNameUseCaseErrorType
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
		request: IUpdateContainerNameUseCase,
	): Promise<Result<undefined, UpdateContainerNameUseCaseErrorType>> {
		const { name } = request;
		const containerIdOrError = ContainerId.create(request.containerId);
		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}
		const containerId = containerIdOrError.value;

		// check the user is the member of the group
		const group = await this.groupRepository.find(containerId);
		if (!group) {
			return Err(
				new GroupIsNotExisting("The requested container does not exist."),
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

		const newContainerOrError = container?.changeName(name);
		if (!newContainerOrError.ok) {
			return Err(newContainerOrError.error);
		}

		const newContainer = newContainerOrError.value;
		await this.containerRepository.update(newContainer);

		return Ok(undefined);
	}
}
