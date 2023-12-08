import { Controller } from "src/Shared";
import { DeleteContainerUseCase } from "src/Group/UseCases/DeleteContainerUseCase/DeleteContainerUseCase";
import { IContainerDto } from "src/Group/Dtos/ContainerDto";

interface IDeleteContainerInput {
	containerId: string;
}

export class DeleteContainerController extends Controller<
	IDeleteContainerInput,
	IContainerDto
> {
	readonly useCase: DeleteContainerUseCase;

	constructor(useCase: DeleteContainerUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IDeleteContainerInput) {
		const { containerId } = input;

		const result = await this.useCase.execute({ containerId });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
