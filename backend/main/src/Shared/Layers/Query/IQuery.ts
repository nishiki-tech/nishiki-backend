import { Result } from "result-ts-type";

/**
 * This is the query interface.
 */
export interface IQuery<IInput, IResponse, UseCaseError> {
	execute(
		request: IInput,
	): Promise<Result<IResponse, UseCaseError>> | Result<IResponse, UseCaseError>;
}
