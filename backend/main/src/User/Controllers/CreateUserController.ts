import { Controller } from "src/Shared";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";

interface ICreateUserInput {
	name: string;
	emailAddress: string;
}

export class CreateUserController extends Controller<ICreateUserInput> {
	readonly useCase: CreateUserUseCase;

	constructor(useCase: CreateUserUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: ICreateUserInput) {
		const { name, emailAddress } = input;

		const result = await this.useCase.execute({ name, emailAddress });

		if (!result.ok) {
			return this.badRequest(result.error.message);
		}

		return this.ok(result.value);
	}
}
