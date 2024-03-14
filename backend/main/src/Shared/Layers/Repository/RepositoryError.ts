/**
 * This class is used for the error handling in the repository.
 *
 * @class RepositoryError
 * @extends {Error}
 */
export abstract class RepositoryError extends Error {
	protected readonly repositoryName: string;
	protected _report: string | string[];

	/**
	 * @param repositoryName - The repository name. If this class is used in the user repository, the name will be UserRepository.
	 * @param message - Error message.
	 * @param report - This is the error message(s). It won't be provided to the outside of this application, used for the log.
	 * @protected
	 */
	protected constructor(
		repositoryName: string,
		message: string,
		report: string | string[],
	) {
		super(message);
		this.repositoryName = `${repositoryName}Error`;
		this._report = report;
	}

	get report(): string | string[] {
		return this._report;
	}

	/**
	 * This method is used to describe the error.
	 */
	public describeError() {
		const repositoryName = this.repositoryName;
		function writeLog(reportMessage: string) {
			console.error(`[${repositoryName}]: ${reportMessage}`);
		}

		if (Array.isArray(this._report)) {
			for (const report in this._report) {
				writeLog(report);
			}
		} else {
			writeLog(this._report);
		}
	}
}
