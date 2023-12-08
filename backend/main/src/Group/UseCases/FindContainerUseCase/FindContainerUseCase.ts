import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	FindContainerUseCaseErrorType,
	IFindContainerUseCase,
} from "src/Group/UseCases/FindContainerUseCase/IFindContainerUseCase";
import { IContainerDto, containerDtoMapper } from "src/Group/Dtos/ContainerDto";

/**
 * Find a container.
 */
export class FindContainerUseCase
	implements
		IUseCase<
			IFindContainerUseCase,
			IContainerDto | null,
			FindContainerUseCaseErrorType
		>
{
	private readonly containerRepository: IContainerRepository;

	constructor(containerRepository: IContainerRepository) {
		this.containerRepository = containerRepository;
	}

	public async execute(
		request: IFindContainerUseCase,
	): Promise<Result<IContainerDto | null, FindContainerUseCaseErrorType>> {
		const containerIdOrError = ContainerId.create(request.containerId);

		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}

		const containerId = containerIdOrError.value;
		const container = await this.containerRepository.find(containerId);

		return Ok(container ? containerDtoMapper(container) : null);
	}
}
