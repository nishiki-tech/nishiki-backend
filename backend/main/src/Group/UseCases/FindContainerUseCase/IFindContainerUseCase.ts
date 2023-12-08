import { ContainerIdDomainError } from "src/Group/Domain/Entities/Container";

export interface IFindContainerUseCase {
	containerId: string;
}

export type FindContainerUseCaseErrorType = ContainerIdDomainError;
