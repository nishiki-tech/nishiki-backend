/**
 * This class is used for the error handling in the repository.
 *
 * @class RepositoryError
 * @extends {Error}
 */
export abstract class RepositoryError extends Error {
	private readonly repositoryName: string;
	private report: string | string[];

	/**
	 * @param repositoryName - The repository name. If this class is used in the user repository, the name will be UserRepository.
	 * @protected
	 */
	protected constructor(repositoryName: string) {
		super("");
		this.repositoryName = `${repositoryName}Error`;
	}

	/**
	 * @param message - Error message.
	 * @param report - This is the error message(s). It won't be provided to the outside of this application, used for the log.
	 */
	public errorMessage(message: string, report: string | string[]) {
		this.message = message;
		this.report = report;
	}

	/**
	 * This method is used to describe the error.
	 */
	public describeError() {
		function writeLog(message: string) {
			console.error(`[${this.name}]: ${message}`);
		}

		if (isArray(this.report)) {
			for (const report in this.report) {
				writeLog(report);
			}
		} else {
			writeLog(this.report);
		}
	}
}
