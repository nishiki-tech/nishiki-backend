import { Controller } from "src/Shared";
import { DeleteUserFromGroupUseCase } from "src/Group/UseCases/DeleteUserFromGroupUseCase/DeleteUserFromGroupUseCase";
import { UserIsNotAuthorized } from "src/Group/UseCases/DeleteUserFromGroupUseCase/IDeleteUserFromGroupUseCase";

interface IDeleteUserFromGroupInput {
	userId: string;
	groupId: string;
	targetUserId: string;
}

export class DeleteUserFromGroupController extends Controller<IDeleteUserFromGroupInput> {
	readonly useCase: DeleteUserFromGroupUseCase;

	constructor(useCase: DeleteUserFromGroupUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IDeleteUserFromGroupInput) {
		const result = await this.useCase.execute({ ...input });

		if (!result.ok) {
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error.message);
		}

		return this.noContent();
	}
}
