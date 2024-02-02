import { Controller } from "src/Shared";
import { DeleteFoodFromContainerUseCase } from "src/Group/UseCases/DeleteFoodFromContainerUseCase/DeleteFoodFromContainerUseCase";
import { UserIsNotAuthorized } from "src/Group/UseCases/DeleteFoodFromContainerUseCase/IDeleteFoodFromContainerUseCase";

interface IDeleteFoodInput {
	userId: string;
	foodId: string;
	containerId: string;
}

export class DeleteFoodFromContainerController extends Controller<IDeleteFoodInput> {
	constructor(private readonly useCase: DeleteFoodFromContainerUseCase) {
		super();
	}
	async handler(input: IDeleteFoodInput) {
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
