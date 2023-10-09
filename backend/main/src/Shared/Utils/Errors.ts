
/**
 * This is base class of use case.
 */
abstract class NishikiBaseError extends Error {
    constructor(message?: string) {
        super(message);
    }

	abstract writeErrorLog(): void
}

/**
 * This class is used to explicitly represent domain object error.
 */
export abstract class DomainObjectError extends NishikiBaseError{
	writeErrorLog() {
		console.error(`[Domain Object Error]: ${this.message}`);
	}
}

/**
 * This class is used to explicitly represent Use Case error.
 */
export abstract class UseCaseError extends NishikiBaseError{
	writeErrorLog() {
		console.error(`[UseCase Error]: ${this.message}`)
	}
}
