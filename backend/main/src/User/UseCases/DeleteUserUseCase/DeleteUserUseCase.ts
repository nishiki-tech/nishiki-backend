import { Err, IUseCase, Ok, Result } from "src/Shared";
import {
	IDeleteUseCaseInput,
	DeleteUserUseCaseErrorType,
} from "./IDeleteUseCase";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { UserId } from "src/User";

/**
 * Deletion operation skips conforming to user existing.
 */
export class DeleteUserUseCase
	implements
		IUseCase<IDeleteUseCaseInput, undefined, DeleteUserUseCaseErrorType>
{
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	public async execute(
		request: IDeleteUseCaseInput,
	): Promise<Result<undefined, DeleteUserUseCaseErrorType>> {
		const { id } = request;

		const userIdOrError = UserId.create(id);

		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}

		const userId = userIdOrError.value;

		await this.userRepository.delete(userId);

		return Ok(undefined);
	}
}
