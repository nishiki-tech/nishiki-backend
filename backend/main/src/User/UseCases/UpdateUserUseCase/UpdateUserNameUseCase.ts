import { Err, IUseCase, Ok, Result } from "src/Shared";
import {
	IUpdateUserNameUseCaseInput,
	UpdateUserNameUseCaseErrorType,
	NotHaveAppropriateRole,
	UserIsNotExisting,
} from "./IUpdateUserNameUseCase";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { UserId } from "src/User";

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
		const { id, name } = request;

		const userIdOrError = UserId.create(id);

		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}

		const user = await this.userRepository.find(userIdOrError.value);

		if (!user) {
			return Err(
				new UserIsNotExisting("The requested user is not registered."),
			);
		}

		if (!user.isAdmin) {
			return Err(
				new NotHaveAppropriateRole("The user has no appropriate role."),
			);
		}

		const nameUpdatedUser = user.changeUserName(name);

		await this.userRepository.update(nameUpdatedUser);

		return Ok(undefined);
	}
}
