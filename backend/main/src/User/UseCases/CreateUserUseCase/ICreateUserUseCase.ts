import { UseCaseError } from "src/Shared";
import { UserDomainError } from "src/User/Domain/Entity/User";

export interface ICreateUserUseCase {
	id: string;
	name?: string;
}

export class UserAlreadyExistingError extends UseCaseError {}

export type CreateUserUseCaseErrorType =
	| UserDomainError
	| UserAlreadyExistingError;
