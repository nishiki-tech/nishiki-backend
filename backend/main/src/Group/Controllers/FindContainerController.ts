import { Controller } from "src/Shared";
import { FindContainerUseCase } from "src/Group/UseCases/FindContainerUseCase/FindContainerUseCase";
import { IContainerDto } from "src/Group/Dtos/ContainerDto";

interface IFindContainerInput {
	userId: string;
	containerId: string;
}

export class FindContainerController extends Controller<
	IFindContainerInput,
	IContainerDto | null
> {
	readonly useCase: FindContainerUseCase;

	constructor(useCase: FindContainerUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IFindContainerInput) {
		const { userId, containerId } = input;

		const result = await this.useCase.execute({ userId, containerId });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
