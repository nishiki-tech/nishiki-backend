import { UserIdDomainError } from "src/User/Domain/User";

export interface IDeleteUseCaseInput {
	id: string;
}

export type DeleteUserUseCaseErrorType = UserIdDomainError;
