import { IUseCase } from "src/Shared";
import {
	IUpdateUserNameUseCaseInput,
	UpdateUserNameUseCaseErrorType,
	UserIsNotExisting,
	IncorrectUsersRequest,
} from "./IUpdateUserNameUseCase";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { UserId } from "src/User";
import { Username } from "src/User/Domain/ValueObject/Username";
import { Err, Ok, Result } from "result-ts-type";

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

		const newUserName = Username.create(name);

		if (!newUserName.ok) {
			return Err(newUserName.error);
		}

		const nameUpdatedUser = user.changeUsername(newUserName.value);

		await this.userRepository.update(nameUpdatedUser);

		return Ok(undefined);
	}
}
