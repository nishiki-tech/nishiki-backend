import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { IUseCase } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";
import {
	CreateContainerUseCaseErrorType,
	ICreateContainerUseCase,
} from "src/Group/UseCases/CreateContainerUseCase/ICreateContainerUseCase";
import { IContainerDto, containerDtoMapper } from "src/Group/Dtos/ContainerDto";

/**
 * Create a new container. You can call this use case without a container name, and then the new container's name will be the default name.
 * @throws: When you try to create a new container that already existing, the error will throw an error.
 */
export class CreateContainerUseCase
	implements
		IUseCase<
			ICreateContainerUseCase,
			IContainerDto,
			CreateContainerUseCaseErrorType
		>
{
	private readonly containerRepository: IContainerRepository;

	constructor(containerRepository: IContainerRepository) {
		this.containerRepository = containerRepository;
	}

	public async execute(
		request: ICreateContainerUseCase,
	): Promise<Result<IContainerDto, CreateContainerUseCaseErrorType>> {
		const { name } = request;
		const containerIdOrError = ContainerId.create();
		if (!containerIdOrError.ok) {
			return Err(containerIdOrError.error);
		}
		const containerId = containerIdOrError.value;
		const containerOrError = Container.default(containerId, name);

		if (!containerOrError.ok) {
			return Err(containerOrError.error);
		}

		const container = containerOrError.value;

		await this.containerRepository.create(container);

		return Ok(containerDtoMapper(container));
	}
}
