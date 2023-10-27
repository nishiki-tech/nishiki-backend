import { Err, IUseCase, Ok, Result, UseCaseError } from "src/Shared";
import {
	IUpdateUserNameUseCaseInput,
	UpdateUserNameUseCaseErrorType,
	UserIsNotExisting,
	IncorrectUsersRequest,
} from "./IUpdateUserNameUseCase";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { UserId } from "src/User";

/**
 * Updating a user's name use case.
 * The updating target must be the same user as the requesting user.
 */
export class UpdateUserNameUseCase
	implements
		IUseCase<
			IUpdateUserNameUseCaseInput,
			undefined,
			UpdateUserNameUseCaseErrorType
		>
{
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	public async execute(
		request: IUpdateUserNameUseCaseInput,
	): Promise<Result<undefined, UpdateUserNameUseCaseErrorType>> {
		const { name } = request;

		const [userIdOrError, targetUserIdOrError] = [
			UserId.create(request.userId),
			UserId.create(request.targetUserId),
		];

		// check if the user ids are correct one.
		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}
		if (!targetUserIdOrError.ok) {
			return Err(targetUserIdOrError.error);
		}

		const userId = userIdOrError.value;
		const targetUserId = targetUserIdOrError.value;

		if (!userId.equal(targetUserId)) {
			return Err(new IncorrectUsersRequest("The user is doesn't match."));
		}

		const user = await this.userRepository.find(userId);

		if (!user) {
			return Err(
				new UserIsNotExisting("The requested user is not registered."),
			);
		}

		const nameUpdatedUser = user.changeUserName(name);

		if (!nameUpdatedUser.ok) {
			return Err(nameUpdatedUser.error);
		}

		await this.userRepository.update(nameUpdatedUser.value);

		return Ok(undefined);
	}
}
