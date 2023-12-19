import { Controller } from "src/Shared";
import { UpdateContainerNameUseCase } from "src/Group/UseCases/UpdateContainerNameUseCase/UpdateContainerNameUseCase";
import { UserIsNotAuthorized } from "../UseCases/UpdateContainerNameUseCase/IUpdateContainerNameUseCase";

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
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error.message);
		}

		return this.noContent();
	}
}
