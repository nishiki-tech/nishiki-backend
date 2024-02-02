import { DomainObjectError, IUseCase, UseCaseError } from "src/Shared";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { Err, Ok, Result } from "result-ts-type";
import { UserId } from "src/User";
import { GroupId } from "src/Group/Domain/Entities/Group";

interface IDeleteGroupUseCaseInput {
	userId: string;
	groupId: string;
}

export class DeleteGroupUseCase
	implements
		IUseCase<IDeleteGroupUseCaseInput, undefined, DeleteGroupUseCaseError>
{
	constructor(private readonly groupRepository: IGroupRepository) {}

	async execute(
		input: IDeleteGroupUseCaseInput,
	): Promise<Result<undefined, DeleteGroupUseCaseError>> {
		const userIdOrError = UserId.create(input.userId);
		const groupIdOrError = GroupId.create(input.groupId);

		if (!(userIdOrError.ok && groupIdOrError.ok)) {
			if (userIdOrError.err) return Err(userIdOrError.error);
			return Err(groupIdOrError.unwrapError()); // group ID must be error
		}

		const userId = userIdOrError.value;
		const groupId = groupIdOrError.value;

		const targetGroup = await this.groupRepository.find(groupId);

		if (!targetGroup) {
			return Err(
				new GroupIsNotExisting("The requested group is not existing."),
			);
		}

		// check if the user has an enough authority
		if (!targetGroup.canEdit(userId)) {
			return Err(
				new UserIsNotAuthorized(
					"The user is not authorized to access the group.",
				),
			);
		}

		await this.groupRepository.delete(groupId);

		return Ok(undefined);
	}
}

type DeleteGroupUseCaseError =
	| GroupIsNotExisting
	| UserIsNotAuthorized
	| DomainObjectError;

export class GroupIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}
