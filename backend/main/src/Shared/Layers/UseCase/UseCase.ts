import { Ok, Result } from "src/Shared";

/**
 * This is the use case interface.
 */
export interface IUseCase<IInput, IResponse, IError> {
	execute(request: IInput): Result<IResponse, IError>;
}
