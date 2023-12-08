import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	DeleteContainerUseCaseErrorType,
	IDeleteContainerUseCase,
} from "src/Group/UseCases/DeleteContainerUseCase/IDeleteContainerUseCase";

/**
 * Deletion operation skips conforming to container existence.
 */
export class DeleteContainerUseCase
	implements
		IUseCase<
			IDeleteContainerUseCase,
			undefined,
			DeleteContainerUseCaseErrorType
		>
{
	private readonly containerRepository: IContainerRepository;

	constructor(containerRepository: IContainerRepository) {
		this.containerRepository = containerRepository;
	}

	public async execute(
		request: IDeleteContainerUseCase,
	): Promise<Result<undefined, DeleteContainerUseCaseErrorType>> {
		const containerIdOrError = ContainerId.create(request.containerId);

		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}

		const containerId = containerIdOrError.value;
		await this.containerRepository.delete(containerId);

		return Ok(undefined);
	}
}
