import { UseCaseError } from "src/Shared";
import { UserDomainError } from "src/User/Domain/Entity/User";

export interface ICreateUserUseCase {
	name?: string;
	emailAddress: string;
}

export class UserAlreadyExistingError extends UseCaseError {}

export type CreateUserUseCaseErrorType =
	| UserDomainError
	| UserAlreadyExistingError;
