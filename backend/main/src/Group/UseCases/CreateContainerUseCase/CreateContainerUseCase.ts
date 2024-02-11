import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	CreateContainerUseCaseErrorType,
	GroupIsNotExisting,
	ICreateContainerUseCase,
	UserIsNotAuthorized,
} from "src/Group/UseCases/CreateContainerUseCase/ICreateContainerUseCase";
import { IContainerDto, containerDtoMapper } from "src/Group/Dtos/ContainerDto";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { UserId } from "src/User";
import { GroupId } from "src/Group/Domain/Entities/Group";

/**
 * Create a new container. You can call this use case without a container name, and then the new container's name will be the default name.
 */
export class CreateContainerUseCase
	implements
		IUseCase<
			ICreateContainerUseCase,
			IContainerDto,
			CreateContainerUseCaseErrorType
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
		request: ICreateContainerUseCase,
	): Promise<Result<IContainerDto, CreateContainerUseCaseErrorType>> {
		const { name } = request;

		// check the user is the member of the group
		const groupIdOrError = GroupId.create(request.groupId);
		if (!groupIdOrError.ok) {
			return Err(groupIdOrError.error);
		}
		const groupId = groupIdOrError.value;
		const group = await this.groupRepository.find(groupId);
		if (!group) {
			return Err(new GroupIsNotExisting("The requested group does not exist."));
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
					"The user is not authorized to create the container.",
				),
			);
		}

		// create new container
		const containerId = ContainerId.generate();
		const containerOrError = Container.default(containerId, name);

		if (!containerOrError.ok) {
			return Err(containerOrError.error);
		}

		const container = containerOrError.value;

		const newGroupOrError = group.addContainerId(containerId);
		if (!newGroupOrError.ok) {
			return Err(newGroupOrError.error);
		}
		const newGroup = newGroupOrError.value;

		await Promise.all([
			this.containerRepository.create(container),
			// add containerId to the Group
			this.groupRepository.update(newGroup),
		]);

		return Ok(containerDtoMapper(container));
	}
}
