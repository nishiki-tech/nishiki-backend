import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User/Domain/Entity/User";
import { Err, IUseCase, Ok, Result } from "src/Shared";
import {
	CreateUserUseCaseErrorType,
	ICreateUserUseCase,
	UserAlreadyExistingError,
} from "src/User/UseCases/CreateUserUseCase/ICreateUserUseCase";
import { IUserDto, userDtoMapper } from "src/User/Dtos/UserDto";

/**
 * Create a new user. You can call this use case without a username, and then the new user's name will be the default name.
 * @throws: When you try to create a new user that already existing, the error will throw an error.
 */
export class CreateUserUseCase
	implements IUseCase<ICreateUserUseCase, IUserDto, CreateUserUseCaseErrorType>
{
	private readonly userRepository: IUserRepository;

	constructor(userRepository: IUserRepository) {
		this.userRepository = userRepository;
	}

	public async execute(
		request: ICreateUserUseCase,
	): Promise<Result<IUserDto, CreateUserUseCaseErrorType>> {
		const { id, name } = request;

		const userIdOrError = UserId.create(id);

		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}

		const userId = userIdOrError.value;

		// check if user is existing
		const existingUser = await this.userRepository.find(userId);
		if (existingUser) {
			return Err(
				new UserAlreadyExistingError("The requested user is already existing.")
			);
		}

		const userOrError = User.create(userIdOrError.value, { name: name! }); // TODO: remove the ! after merge the develop

		if (!userOrError.ok) {
			return Err(userOrError.error);
		}

		const user = userOrError.value;

		await this.userRepository.create(user);

		return Ok(userDtoMapper(user));
	}
}
