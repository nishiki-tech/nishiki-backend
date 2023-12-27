import { UseCaseError } from "src/Shared";
import {
	GroupIdDomainError,
	GroupDomainError,
} from "src/Group/Domain/Entities/Group";

export interface IUpdateGroupNameUseCase {
	userId: string;
	groupId: string;
	name: string;
}

export class GroupIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}

export type UpdateGroupNameUseCaseErrorType =
	| GroupIsNotExisting
	| GroupIdDomainError
	| GroupDomainError
	| UserIsNotAuthorized;
