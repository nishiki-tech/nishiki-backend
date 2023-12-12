import { Controller } from "src/Shared";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";

interface IUpdateContainerNameInput {
	containerId: string;
	name: string;
}

export class UpdateContainerNameController extends Controller<IUpdateContainerNameInput> {
	readonly useCase: UpdateContainerNameUseCase;

	constructor(useCase: UpdateContainerNameUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IUpdateContainerNameInput) {
		const { containerId, name } = input;

		const result = await this.useCase.execute({ containerId, name });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.accepted();
	}
}
