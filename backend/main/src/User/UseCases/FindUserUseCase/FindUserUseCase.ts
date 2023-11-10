import { FindUserUseCaseErrorType } from "./IFindUserUseCase";
import { IUseCase, Ok, Result, Err } from "src/Shared";
import { UserId } from "src/User";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { IUserDto, userDtoMapper } from "src/User/Dtos/UserDto";

export class FindUserUseCase
	implements IUseCase<string, IUserDto | null, FindUserUseCaseErrorType>
{
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	public async execute(
		request: string,
	): Promise<Result<IUserDto | null, FindUserUseCaseErrorType>> {
		const userIdOrError = UserId.create(request);

		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}

		const user = await this.userRepository.find(userIdOrError.value);

		return Ok(user ? userDtoMapper(user) : null);
	}
}
