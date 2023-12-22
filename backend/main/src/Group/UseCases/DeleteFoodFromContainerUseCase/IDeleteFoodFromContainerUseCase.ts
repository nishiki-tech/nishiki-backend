import { UseCaseError } from "src/Shared";
import {
	ContainerIdDomainError,
	ContainerDomainError,
} from "src/Group/Domain/Entities/Container";

export interface IDeleteFoodFromContainerUseCase {
	userId: string;
	containerId: string;
	foodId: string;
}

export class ContainerIsNotExisting extends UseCaseError {}
export class FoodIsNotExisting extends UseCaseError {}
export class UserIsNotAuthorized extends UseCaseError {}

export type DeleteFoodFromContainerUseCaseErrorType =
	| ContainerIsNotExisting
	| FoodIsNotExisting
	| ContainerIdDomainError
	| ContainerDomainError
	| UserIsNotAuthorized;
