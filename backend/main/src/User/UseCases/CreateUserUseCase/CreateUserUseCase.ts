import {IUserRepository} from "src/User/Domain/IUserRepository";
import {User, UserId} from "src/User/Domain/User";
import {Err, IUseCase, Ok, Result} from "src/Shared";
import {CreateUserUseCaseErrorType, ICreateUserUseCase} from "src/User/UseCases/CreateUserUseCase/ICreateUserUseCase";
import {IUserDto, userDtoMapper} from "src/User/Dtos/UserDto";

export class CreateUserUseCase implements IUseCase<ICreateUserUseCase, IUserDto, CreateUserUseCaseErrorType> {
    private readonly userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    public async execute(request: ICreateUserUseCase): Promise<Result<IUserDto, CreateUserUseCaseErrorType>> {

        const { id, name } = request;

        const userIdOrError = UserId.create(id);

        if (!userIdOrError.ok) {
            return Err(userIdOrError.error);
        }

        const userOrError = User.create(userIdOrError.value, {name})

        if (!userOrError.ok) {
            return Err(userOrError.error)
        }

        const user = userOrError.value;

        await this.userRepository.create(user);

        return Ok(userDtoMapper(user));
    }
}