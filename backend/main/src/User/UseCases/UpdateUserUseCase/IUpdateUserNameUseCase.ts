import {UseCaseError} from "src/Shared";

export interface IUpdateUserNameUseCaseInput {
	id: string,
	name: string
}

export class NotHaveAppropriateRole extends UseCaseError {}
export class UserIsNotExisting extends UseCaseError {}

export type UpdateUserNameUseCaseErrorType = UserIsNotExisting |  NotHaveAppropriateRole;