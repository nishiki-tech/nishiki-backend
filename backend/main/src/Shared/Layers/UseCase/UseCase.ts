import {Ok, Result} from "src/Shared";

/**
 * This is the use case interface.
 */
export interface IUseCase<IInput, IResponse, UseCaseError> {
    execute(request: IInput): Promise<Result<IResponse, UseCaseError>> | Result<IResponse, UseCaseError>
}


/**
 * This is base class of use case.
 */
abstract class UseCaseBaseError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

/**
 * This class is used to explicitly represent domain object error.
 */
export abstract class DomainObjectError extends UseCaseBaseError{}

/**
 * This class is used to explicitly represent Use Case error.
 */
export abstract class UseCaseError extends UseCaseBaseError{}
