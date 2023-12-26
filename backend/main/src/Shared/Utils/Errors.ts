/**
 * This is the base class error of this application.
 */
abstract class NishikiBaseError extends Error {
	abstract writeErrorLog(): void;
}

/**
 * This class is used to explicitly represent domain object error.
 */
export abstract class DomainObjectError extends NishikiBaseError {
	writeErrorLog() {
		console.error(`[Domain Object Error]: ${this.message}`);
	}
}

/**
 * This class is used to explicitly represent Use Case error.
 */
export abstract class UseCaseError extends NishikiBaseError {
	writeErrorLog() {
		console.error(`[UseCase Error]: ${this.message}`);
	}
}

export abstract class QueryError extends NishikiBaseError {
	writeErrorLog() {
		console.error(`[Query Error]: ${this.message}`);
	}
}
