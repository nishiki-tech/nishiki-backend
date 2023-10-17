import { APIGatewayProxyResultV2 } from "aws-lambda";
import { LambdaProxyController } from "src/Shared";
import { NotHaveAppropriateRole } from "src/User/UseCases/UpdateUserUseCase/IUpdateUserNameUseCase";
import { UpdateUserNameUseCase } from "src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";

interface IUpdateUserNameInput {
	id: string;
	name: string;
}

export class UpdateUserNameController extends LambdaProxyController<IUpdateUserNameInput> {
	readonly useCase: UpdateUserNameUseCase;

	constructor(useCase: UpdateUserNameUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(
		input: IUpdateUserNameInput,
	): Promise<APIGatewayProxyResultV2> {
		const result = await this.useCase.execute(input);

		if (!result.ok) {
			const message = result.error.message;

			// you can extract and change response
			if (result.error instanceof NotHaveAppropriateRole) {
				return this.unauthorized(message);
			}

			return this.badRequest(message);
		}

		return this.accepted();
	}
}
