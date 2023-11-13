import { FindUserUseCaseErrorType } from "./IFindUserUseCase";
import { IUseCase } from "src/Shared";
import { UserId } from "src/User";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { IUserDto, userDtoMapper } from "src/User/Dtos/UserDto";
import { Err, Ok, Result } from "result-ts-type";

export class FindUserUseCase
	implements IUseCase<string, IUserDto | undefined, FindUserUseCaseErrorType>
{
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	public async execute(
		request: string,
	): Promise<Result<IUserDto | undefined, FindUserUseCaseErrorType>> {
		const userIdOrError = UserId.create(request);

		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}

		const user = await this.userRepository.find(userIdOrError.value);

		return Ok(user ? userDtoMapper(user) : undefined);
	}
}
