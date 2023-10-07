import {IUserRepository} from "src/User/Domain/UserRepository";
import {User, UserId} from "src/User/Domain/User";

export class CreateUserUseCase {
    private readonly userRepository: IUserRepository;
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    run(userId: UserId, name: string) {
        const userOrError = User.create(userId, { name })

        if (!userOrError.ok) {}

    }
}