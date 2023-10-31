import { UserDomainError } from "src/User/Domain/Entity/User";

export interface ICreateUserUseCase {
	id: string;
	name: string;
}

export type CreateUserUseCaseErrorType = UserDomainError;
