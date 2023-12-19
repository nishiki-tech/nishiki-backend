import { UseCaseError } from "src/Shared";
import {
	ContainerIdDomainError,
	ContainerDomainError,
} from "src/Group/Domain/Entities/Container";

export interface IUpdateContainerNameUseCase {
	userId: string;
	containerId: string;
	name: string;
}

export class ContainerIsNotExisting extends UseCaseError {}
export class GroupIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}

export type UpdateContainerNameUseCaseErrorType =
	| ContainerIsNotExisting
	| ContainerIdDomainError
	| ContainerDomainError
	| GroupIsNotExisting
	| UserIsNotAuthorized;
