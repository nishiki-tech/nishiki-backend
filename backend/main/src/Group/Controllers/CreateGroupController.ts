import { Controller } from "src/Shared";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { IGroupDto } from "src/Group/Dtos/GroupDto";
import { UserIsNotAuthorized } from "../UseCases/CreateGroupUseCase/ICreateGroupUseCase";

interface ICreateGroupInput {
	userId: string;
	name?: string;
}

export class CreateGroupController extends Controller<
	ICreateGroupInput,
	IGroupDto
> {
	readonly useCase: CreateGroupUseCase;

	constructor(useCase: CreateGroupUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: ICreateGroupInput) {
		const { userId, name } = input;

		const result = await this.useCase.execute({ userId, name });

		if (!result.ok) {
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
