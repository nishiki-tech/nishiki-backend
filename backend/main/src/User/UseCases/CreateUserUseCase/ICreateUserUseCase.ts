import { UserDomainError } from "src/User/Domain/User";
import { UseCaseError } from "src/Shared";

export interface ICreateUserUseCase {
	id: string;
	name?: string;
}

export class UserAlreadyExistingError extends UseCaseError {}

export type CreateUserUseCaseErrorType = UserDomainError | UserAlreadyExistingError;