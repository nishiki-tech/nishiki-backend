import { ContainerIdDomainError } from "src/Group/Domain/Entities/Container";
import { QueryError } from "src/Shared/Utils/Errors";

export interface IFindContainerQuery {
	userId: string;
	containerId: string;
}

export class UserIsNotAuthorized extends QueryError {}
export class InvalidInput extends QueryError {}

export type FindContainerQueryErrorType =
	| ContainerIdDomainError
	| InvalidInput
	| UserIsNotAuthorized;
