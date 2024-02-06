import {
	DeleteGroupUseCase,
	IDeleteGroupUseCaseInput,
	UserIsNotAuthorized,
} from "src/Group/UseCases/DeleteGroupUseCase/DeleteGroupUseCase";
import { Controller } from "src/Shared";

export class DeleteGroupController extends Controller<IDeleteGroupUseCaseInput> {
	constructor(readonly useCase: DeleteGroupUseCase) {
		super();
	}

	async handler(input: IDeleteGroupUseCaseInput) {
		const result = await this.useCase.execute({ ...input });
		if (result.err) {
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error.message);
		}
		return this.noContent();
	}
}
