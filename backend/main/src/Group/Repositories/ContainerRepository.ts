import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { ContainerData } from "src/Shared/Adapters/DB/NishikiDBTypes";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";
import { hasError } from "result-ts-type";

/**
 * Container repository.
 * The container item's definition is described in the following document.
 * @link https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database#container
 */
export class ContainerRepository implements IContainerRepository {
	private readonly nishikiDbClient: NishikiDynamoDBClient;

	/**
	 * If the client is not specified, the default client is used.
	 * @param nishikiDbClient
	 * @throws the data in the repository is invalid.
	 */
	constructor(nishikiDbClient?: NishikiDynamoDBClient) {
		this.nishikiDbClient = nishikiDbClient
			? nishikiDbClient
			: new NishikiDynamoDBClient();
	}

	async find(id: ContainerId): Promise<Container | null> {
		const containerData = await this.nishikiDbClient.getContainer(id.id);

		return containerData ? createContainerObject(containerData) : null;
	}

	/**
	 *
	 * Create a container.
	 * @param container
	 */
	async create(container: Container): Promise<undefined> {
		await this.nishikiDbClient.saveContainer({
			containerId: container.id.id,
			containerName: container.name,
			foods: container.foods,
		});
	}

	/**
	 * Update a container
	 * @param container
	 */
	async update(container: Container): Promise<undefined> {
		await this.nishikiDbClient.saveContainer({
			containerId: container.id.id,
			containername: container.name.name,
			emailAddress: container.emailAddress.emailAddress,
		});
	}

	/**
	 * Delete a container
	 * @param id - target container id
	 */
	async delete(id: ContainerId): Promise<undefined> {
		await this.nishikiDbClient.deleteContainer(id.id);
	}
}

/**
 * Create a container from primitive values.
 * When containerData is invalid, this function throws an error.
 * @param containerData
 * @throws ContainerRepositoryError - this error will be thrown when the data is invalid.
 */
const createContainerObject = (containerData: ContainerData): Container => {
	const containerIdOrErr = ContainerId.create(containerData.containerId);
	const emailOrErr = EmailAddress.create(containerData.emailAddress);
	const containernameOrErr = Containername.create(containerData.containername);

	const errorResult = hasError([
		containerIdOrErr,
		emailOrErr,
		containernameOrErr,
	]);

	if (errorResult.err) {
		const report = [
			`ContainerId: ${containerData.containerId}`,
			errorResult.error.message,
		];
		throw new ContainerRepositoryError(errorResult.error.message, report);
	}

	const containerId = containerIdOrErr.unwrap();
	const email = emailOrErr.unwrap();
	const name = containernameOrErr.unwrap();

	return Container.create(containerId, {
		emailAddress: email,
		containername: name,
	});
};

class ContainerRepositoryError extends RepositoryError {
	constructor(message: string, report: string | string[]) {
		super("ContainerRepositoryError", message, report);
	}
}
