import { ContainerIdDomainError } from "src/Group/Domain/Entities/Container";
import { UseCaseError } from "src/Shared";

export interface IDeleteContainerUseCase {
	containerId: string;
	userId: string;
}

export class GroupIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}

export type DeleteContainerUseCaseErrorType =
	| ContainerIdDomainError
	| GroupIsNotExisting
	| UserIsNotAuthorized;
