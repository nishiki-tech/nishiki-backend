import { Err, IUseCase, Ok, Result } from "src/Shared";
import { IUserDto, userDtoMapper } from "src/User/Dtos/UserDto";
import { FindUsersUseCaseErrorType } from "src/User/UseCases/FindUsersUseCase/IFindUsersUseCase";
import { IUserRepository } from "src/User/Domain/IUserRepository";
import { UserId } from "src/User";
import { UserIdDomainError } from "src/User/Domain/Entity/User";

/**
 * find multiple users
 */
export class FindUsersUseCase
	implements IUseCase<string[], IUserDto[], FindUsersUseCaseErrorType>
{
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	public async execute(
		request: string[],
	): Promise<Result<IUserDto[], FindUsersUseCaseErrorType>> {
		// empty id array
		if (request.length === 0) return Ok([]);

		let userIds: UserId[] = [];

		request.forEach((el) => {
			const id = UserId.create(el);
			if (!id.ok) {
				return Err(new UserIdDomainError("error"));
			}
			userIds.push(id.value);
		});

		const users = await this.userRepository.find(userIds);

		return Ok(users.map((el) => userDtoMapper(el)));
	}
}
