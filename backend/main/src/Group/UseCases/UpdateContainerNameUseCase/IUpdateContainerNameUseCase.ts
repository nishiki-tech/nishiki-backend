import { UseCaseError } from "src/Shared";
import {
	ContainerIdDomainError,
	ContainerDomainError,
} from "src/Group/Domain/Entities/Container";

export interface IUpdateContainerNameUseCase {
	containerId: string;
	name: string;
}

export class ContainerIsNotExisting extends UseCaseError {}

export type UpdateContainerNameUseCaseErrorType =
	| ContainerIsNotExisting
	| ContainerIdDomainError
	| ContainerDomainError;
