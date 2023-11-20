import { UseCaseError } from "src/Shared";
import { ContainerDomainError } from "src/Group/Domain/Entities/Container";

export interface ICreateContainerUseCase {
	name?: string;
}

export class ContainerAlreadyExistingError extends UseCaseError {}

export type CreateContainerUseCaseErrorType = ContainerDomainError;
