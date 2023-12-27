import { UseCaseError } from "src/Shared";
import {
	GroupIdDomainError,
	GroupDomainError,
} from "src/Group/Domain/Entities/Group";

export interface IDeleteUserFromGroupUseCase {
	userId: string;
	groupId: string;
	targetUserId: string;
}

export class GroupIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}

export type DeleteUserFromGroupUseCaseErrorType =
	| GroupIsNotExisting
	| GroupIdDomainError
	| GroupDomainError
	| UserIsNotAuthorized;
