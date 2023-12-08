import { ContainerIdDomainError } from "src/Group/Domain/Entities/Container";

export interface IDeleteContainerUseCase {
	id: string;
}

export type DeleteContainerUseCaseErrorType = ContainerIdDomainError;
