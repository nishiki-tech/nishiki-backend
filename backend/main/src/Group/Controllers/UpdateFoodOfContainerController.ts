import { Controller } from "src/Shared";
import { UpdateFoodOfContainerUseCase } from "src/Group/UseCases/UpdateFoodOfContainerUseCase/UpdateFoodOfContainerUseCase";
import { UserIsNotAuthorized } from "../UseCases/UpdateFoodOfContainerUseCase/IUpdateFoodOfContainerUseCase";

interface IUpdateFoodOfContainerInput {
	userId: string;
	containerId: string;
	foodId: string;
	name: string;
	unit?: string;
	quantity?: number;
	expiry?: Date;
	category: string;
}

export class UpdateFoodOfContainerController extends Controller<IUpdateFoodOfContainerInput> {
	readonly useCase: UpdateFoodOfContainerUseCase;

	constructor(useCase: UpdateFoodOfContainerUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IUpdateFoodOfContainerInput) {
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
