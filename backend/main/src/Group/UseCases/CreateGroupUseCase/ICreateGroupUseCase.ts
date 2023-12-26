import { GroupDomainError } from "src/Group/Domain/Entities/Group";

export interface ICreateGroupUseCase {
	name?: string;
	userId: string;
}

export type CreateGroupUseCaseErrorType = GroupDomainError;
