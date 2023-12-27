import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { GroupId } from "src/Group/Domain/Entities/Group";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	UpdateGroupNameUseCaseErrorType,
	IUpdateGroupNameUseCase,
	GroupIsNotExisting,
	UserIsNotAuthorized,
} from "src/Group/UseCases/UpdateGroupNameUseCase/IUpdateGroupNameUseCase";
import { UserId } from "src/User";

export class UpdateGroupNameUseCase
	implements
		IUseCase<
			IUpdateGroupNameUseCase,
			undefined,
			UpdateGroupNameUseCaseErrorType
		>
{
	private readonly groupRepository: IGroupRepository;

	constructor(groupRepository: IGroupRepository) {
		this.groupRepository = groupRepository;
	}

	public async execute(
		request: IUpdateGroupNameUseCase,
	): Promise<Result<undefined, UpdateGroupNameUseCaseErrorType>> {
		const { groupId, userId, name } = request;

		const groupIdOrError = GroupId.create(groupId);
		if (!groupIdOrError.ok) {
			return Err(groupIdOrError.error);
		}
		const groupIdValue = groupIdOrError.value;
		const group = await this.groupRepository.find(groupIdValue);

		if (!group) {
			return Err(
				new GroupIsNotExisting("The requested group is not existing."),
			);
		}

		// check the user is the member of the group
		const userIdOrError = UserId.create(userId);
		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}
		const userIdValue = userIdOrError.value;
		const canEdit = group.canEdit(userIdValue);

		if (!canEdit) {
			return Err(
				new UserIsNotAuthorized(
					"The user is not authorized to access the group.",
				),
			);
		}

		const newGroupOrError = group?.changeName(name);
		if (!newGroupOrError.ok) {
			return Err(newGroupOrError.error);
		}

		const newGroup = newGroupOrError.value;
		await this.groupRepository.update(newGroup);

		return Ok(undefined);
	}
}
