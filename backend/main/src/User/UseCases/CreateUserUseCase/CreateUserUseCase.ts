import { IUserRepository } from "src/User/Domain/IUserRepository";
import { User, UserId } from "src/User/Domain/Entity/User";
import { Err, IUseCase, Ok, Result } from "src/Shared";
import {
	CreateUserUseCaseErrorType,
	ICreateUserUseCase,
	UserAlreadyExistingError,
} from "src/User/UseCases/CreateUserUseCase/ICreateUserUseCase";
import { IUserDto, userDtoMapper } from "src/User/Dtos/UserDto";
import { Username } from "src/User/Domain/ValueObject/Username";
import {EmailAddress} from "src/User/Domain/ValueObject/EmailAddress";

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
		const { id, name  } = request;

		const userIdOrError = UserId.create(id);
		const usernameOrError = Username.create(name);
		const emailAddressOrError = EmailAddress.create(request.emailAddress);

		if (!userIdOrError.ok) {
			return Err(userIdOrError.error);
		}

		if (!usernameOrError.ok) {
			return Err(usernameOrError.error);
		}

		if (!emailAddressOrError.ok) {
			return Err(emailAddressOrError.error)
		}

		const userId = userIdOrError.value;
		const username = usernameOrError.value;
		const emailAddress = emailAddressOrError.value;

		// check if user is existing
		const existingUser = await this.userRepository.find(userId);
		if (existingUser) {
			return Err(
				new UserAlreadyExistingError("The requested user is already existing."),
			);
		}

		const user = User.create(userIdOrError.value, { username, emailAddress });

		await this.userRepository.create(user);

		return Ok(userDtoMapper(user));
	}
}
