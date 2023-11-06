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
import { EmailAddress } from "src/User/Domain/ValueObject/EmailAddress";

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
		const { name } = request;

		const userId = UserId.generate();
		const usernameOrError = Username.create(name);
		const emailAddressOrError = EmailAddress.create(request.emailAddress);

		if (!usernameOrError.ok) {
			return Err(usernameOrError.error);
		}

		if (!emailAddressOrError.ok) {
			return Err(emailAddressOrError.error);
		}

		const username = usernameOrError.value;
		const emailAddress = emailAddressOrError.value;

		// check if user is existing
		const existingUser = await this.userRepository.find(userId);
		if (existingUser) {
			return Err(
				new UserAlreadyExistingError("The requested user is already existing."),
			);
		}

		const user = User.create(userId, { username, emailAddress });

		await this.userRepository.create(user);

		return Ok(userDtoMapper(user));
	}
}
