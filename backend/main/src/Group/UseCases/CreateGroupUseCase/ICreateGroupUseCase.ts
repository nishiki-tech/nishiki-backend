import { GroupDomainError } from "src/Group/Domain/Entities/Group";
import { UseCaseError } from "src/Shared";

export interface ICreateGroupUseCase {
	name?: string;
	userId: string;
}
export class UserIsNotAuthorized extends UseCaseError {}

export type CreateGroupUseCaseErrorType =
	| GroupDomainError
	| UserIsNotAuthorized;
