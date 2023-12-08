import { ContainerIdDomainError } from "src/Group/Domain/Entities/Container";

export interface IDeleteContainerUseCase {
	containerId: string;
}

export type DeleteContainerUseCaseErrorType = ContainerIdDomainError;
