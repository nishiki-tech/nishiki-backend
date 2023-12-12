import { Controller } from "src/Shared";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { IContainerDto } from "src/Group/Dtos/ContainerDto";

interface ICreateContainerInput {
	name?: string;
	groupId: string;
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
		const { name, groupId } = input;

		const result = await this.useCase.execute({ name, groupId });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
