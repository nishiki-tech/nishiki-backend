import { UseCaseError } from "src/Shared";
import { UserDomainError, UserIdDomainError } from "src/User/Domain/User";

export interface IUpdateUserNameUseCaseInput {
	userId: string;
	targetUserId: string;
	name: string;
}

/**
 * When the user ID and target user ID are the not same, this error occurs.
 */
export class IncorrectUsersRequest extends UseCaseError {}

export class UserIsNotExisting extends UseCaseError {}

export type UpdateUserNameUseCaseErrorType =
	| UserIsNotExisting
	| IncorrectUsersRequest
	| UserIdDomainError
	| UserDomainError;
