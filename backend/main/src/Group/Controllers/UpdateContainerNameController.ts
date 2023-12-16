import { Controller } from "src/Shared";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";

interface IUpdateContainerNameInput {
	userId: string;
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
		const { userId, containerId, name } = input;

		const result = await this.useCase.execute({ userId, containerId, name });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.accepted();
	}
}
