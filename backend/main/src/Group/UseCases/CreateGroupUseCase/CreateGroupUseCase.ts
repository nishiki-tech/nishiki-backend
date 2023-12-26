import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	CreateGroupUseCaseErrorType,
	ICreateGroupUseCase,
} from "src/Group/UseCases/CreateGroupUseCase/ICreateGroupUseCase";
import { IGroupDto, groupDtoMapper } from "src/Group/Dtos/GroupDto";
import { UserId } from "src/User";

/**
 * Create a new group. You can call this use case without a group name, and then the new group's name will be the default name.
 */
export class CreateGroupUseCase
	implements
		IUseCase<ICreateGroupUseCase, IGroupDto, CreateGroupUseCaseErrorType>
{
	private readonly groupRepository: IGroupRepository;

	constructor(groupRepository: IGroupRepository) {
		this.groupRepository = groupRepository;
	}

	public async execute(
		request: ICreateGroupUseCase,
	): Promise<Result<IGroupDto, CreateGroupUseCaseErrorType>> {
		const { name, userId } = request;

		// create new group
		const groupId = GroupId.generate();
		const groupOrError = Group.default(groupId, name);

		if (!groupOrError.ok) {
			return Err(groupOrError.error);
		}

		const group = groupOrError.value;

		// add creator user to the group
		const userIdOrError = UserId.create(userId);
		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}
		const userIdValue = userIdOrError.value;
		const userAddedGroupOrError = group.addUserId(userIdValue);
		if (!userAddedGroupOrError.ok) {
			return Err(userAddedGroupOrError.error);
		}
		const userAddedGroup = userAddedGroupOrError.value;

		await this.groupRepository.create(userAddedGroup);

		return Ok(groupDtoMapper(group));
	}
}
