import { Controller } from "src/Shared";
import { IncorrectUsersRequest } from "src/User/UseCases/UpdateUserUseCase/IUpdateUserNameUseCase";
import { UpdateUserNameUseCase } from "src/User/UseCases/UpdateUserUseCase/UpdateUserNameUseCase";

interface IUpdateUserNameInput {
	userId: string;
	targetUserId: string;
	name: string;
}

export class UpdateUserNameController extends Controller<IUpdateUserNameInput> {
	readonly useCase: UpdateUserNameUseCase;

	constructor(useCase: UpdateUserNameUseCase) {
		super();
		this.useCase = useCase;
	}
	protected async handler(input: IUpdateUserNameInput) {
		const result = await this.useCase.execute(input);

		if (!result.ok) {
			const message = result.error.message;

			// you can extract and change response
			if (result.error instanceof IncorrectUsersRequest) {
				return this.unauthorized(message);
			}

			return this.badRequest(message);
		}

		return this.accepted();
	}
}
