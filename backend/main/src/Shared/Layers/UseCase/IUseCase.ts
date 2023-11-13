import { Result } from "result-ts-type";

/**
 * This is the use case interface.
 */
export interface IUseCase<IInput, IResponse, UseCaseError> {
	execute(
		request: IInput,
	): Promise<Result<IResponse, UseCaseError>> | Result<IResponse, UseCaseError>;
}
