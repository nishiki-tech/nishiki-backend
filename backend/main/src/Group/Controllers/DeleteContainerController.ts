import { Controller } from "src/Shared";
import { DeleteContainerUseCase } from "src/Group/UseCases/DeleteContainerUseCase/DeleteContainerUseCase";
import { IContainerDto } from "src/Group/Dtos/ContainerDto";
import { UserIsNotAuthorized } from "../UseCases/DeleteContainerUseCase/IDeleteContainerUseCase";

interface IDeleteContainerInput {
	userId: string;
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
		const { userId, containerId } = input;

		const result = await this.useCase.execute({ userId, containerId });

		if (!result.ok) {
			if (result.error instanceof UserIsNotAuthorized) {
				return this.forbidden(result.error.message);
			}
			return this.badRequest(result.error.message);
		}

		return this.noContent();
	}
}
