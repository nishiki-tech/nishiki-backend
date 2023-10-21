import { UserDomainError } from "src/User/Domain/User";

export interface ICreateUserUseCase {
	id: string;
	name: string;
}

export type CreateUserUseCaseErrorType = UserDomainError;
