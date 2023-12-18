import { Controller } from "src/Shared";
import { AddFoodToContainerUseCase } from "src/Group/UseCases/AddFoodToContainerUseCase/AddFoodToContainerUseCase";

interface IAddFoodToContainerInput {
	userId: string;
	containerId: string;
	name: string;
	unit?: string;
	quantity?: number;
	expiry?: Date;
}

export class AddFoodToContainerController extends Controller<IAddFoodToContainerInput> {
	readonly useCase: AddFoodToContainerUseCase;

	constructor(useCase: AddFoodToContainerUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IAddFoodToContainerInput) {
		const result = await this.useCase.execute({ ...input });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.noContent();
	}
}
