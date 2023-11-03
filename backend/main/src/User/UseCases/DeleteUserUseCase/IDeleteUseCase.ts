import { UserIdDomainError } from "src/User/Domain/Entity/User";

export interface IDeleteUseCaseInput {
	id: string;
}

export type DeleteUserUseCaseErrorType = UserIdDomainError;
