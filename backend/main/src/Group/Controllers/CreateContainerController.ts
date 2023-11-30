import { Controller } from "src/Shared";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { IContainerDto } from "src/Group/Dtos/ContainerDto";

interface ICreateContainerInput {
	name?: string;
}

export class CreateContainerController extends Controller<
	ICreateContainerInput,
	IContainerDto
> {
	readonly useCase: CreateContainerUseCase;

	constructor(useCase: CreateContainerUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: ICreateContainerInput) {
		const { name } = input;

		const result = await this.useCase.execute({ name });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
