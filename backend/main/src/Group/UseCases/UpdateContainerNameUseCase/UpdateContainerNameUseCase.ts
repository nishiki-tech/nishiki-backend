import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	UpdateContainerNameUseCaseErrorType,
	IUpdateContainerNameUseCase,
	ContainerIsNotExisting,
} from "src/Group/UseCases/UpdateContainerNameUseCase/IUpdateContainerNameUseCase";

/**
 * Deletion operation skips conforming to container existence.
 */
export class UpdateContainerNameUseCase
	implements
		IUseCase<
			IUpdateContainerNameUseCase,
			undefined,
			UpdateContainerNameUseCaseErrorType
		>
{
	private readonly containerRepository: IContainerRepository;

	constructor(containerRepository: IContainerRepository) {
		this.containerRepository = containerRepository;
	}

	public async execute(
		request: IUpdateContainerNameUseCase,
	): Promise<Result<undefined, UpdateContainerNameUseCaseErrorType>> {
		const { name } = request;
		const containerIdOrError = ContainerId.create(request.containerId);

		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}

		const containerId = containerIdOrError.value;
		const container = await this.containerRepository.find(containerId);

		if (!container) {
			return Err(
				new ContainerIsNotExisting("The requested container is not existing."),
			);
		}

		const newContainerOrError = container?.changeName(name);

		if (!newContainerOrError.ok) {
			return Err(newContainerOrError.error);
		}

		const newContainer = newContainerOrError.value;
		await this.containerRepository.update(newContainer);

		return Ok(undefined);
	}
}
