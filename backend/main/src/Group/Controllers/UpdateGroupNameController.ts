import { Controller } from "src/Shared";
import { UpdateGroupNameUseCase } from "src/Group/UseCases/UpdateGroupNameUseCase/UpdateGroupNameUseCase";
import {
	IUpdateGroupNameUseCase,
	UserIsNotAuthorized,
} from "src/Group/UseCases/UpdateGroupNameUseCase/IUpdateGroupNameUseCase";

export class UpdateGroupNameController extends Controller<
	IUpdateGroupNameUseCase,
	undefined
> {
	constructor(private readonly updateGroupNameUseCase: UpdateGroupNameUseCase) {
		super();
	}

	public async handler(request: IUpdateGroupNameUseCase) {
		const result = await this.updateGroupNameUseCase.execute(request);
		if (result.err) {
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error);
		}
		return this.noContent();
	}
}
