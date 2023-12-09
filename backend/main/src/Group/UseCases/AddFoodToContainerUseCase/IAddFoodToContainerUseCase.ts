import { UseCaseError } from "src/Shared";
import {
	ContainerIdDomainError,
	ContainerDomainError,
} from "src/Group/Domain/Entities/Container";

export interface IAddFoodToContainerUseCase {
	containerId: string;
	name: string;
	unit?: string;
	quantity?: number;
	expiry?: Date;
}

export class ContainerIsNotExisting extends UseCaseError {}

export type AddFoodToContainerUseCaseErrorType =
	| ContainerIsNotExisting
	| ContainerIdDomainError
	| ContainerDomainError;
