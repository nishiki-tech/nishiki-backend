import { UseCaseError } from "src/Shared";
import { ContainerDomainError } from "src/Group/Domain/Entities/Container";

export interface ICreateContainerUseCase {
	name?: string;
	groupId: string;
	userId: string;
}

export class GroupIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}

export type CreateContainerUseCaseErrorType =
	| ContainerDomainError
	| GroupIsNotExisting
	| UserIsNotAuthorized;
