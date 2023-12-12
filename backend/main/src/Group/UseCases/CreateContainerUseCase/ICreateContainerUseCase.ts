import { UseCaseError } from "src/Shared";
import { ContainerDomainError } from "src/Group/Domain/Entities/Container";

export interface ICreateContainerUseCase {
	name?: string;
	groupId: string;
}

export class GroupIsNotExisting extends UseCaseError {}

export type CreateContainerUseCaseErrorType =
	| ContainerDomainError
	| GroupIsNotExisting;
