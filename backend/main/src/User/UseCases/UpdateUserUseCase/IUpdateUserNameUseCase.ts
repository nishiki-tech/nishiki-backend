import { UseCaseError } from "src/Shared";
import {
	UserIdDomainError,
	UserDomainError,
} from "src/User/Domain/Entity/User";

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
