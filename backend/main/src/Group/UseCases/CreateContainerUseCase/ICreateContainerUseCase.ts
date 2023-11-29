import { UseCaseError } from "src/Shared";
import { ContainerDomainError } from "src/Group/Domain/Entities/Container";

export interface ICreateContainerUseCase {
	name?: string;
}

export type CreateContainerUseCaseErrorType = ContainerDomainError;
