import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import {
	ContainerData,
	Food as FoodData,
} from "src/Shared/Adapters/DB/NishikiDBTypes";
import { RepositoryError } from "src/Shared/Layers/Repository/RepositoryError";
import { Food, IFoodProps } from "../Domain/Entities/Food";
import { Expiry } from "../Domain/ValueObjects/Expiry";
import { Quantity } from "../Domain/ValueObjects/Quantity";
import { Unit } from "../Domain/ValueObjects/Unit";

/**
 * Container repository.
 * The container item's definition is described in the following document.
 * @link https://nishiki-tech.github.io/nishiki-documents/project-document/database#container
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

	async find(id: ContainerId): Promise<Container | null>;
	async find(id: ContainerId[]): Promise<Container[]>;
	async find(
		id: ContainerId | ContainerId[],
	): Promise<Container | Container[] | null> {
		// if the ID is array.
		if (Array.isArray(id)) {
			const containers = await Promise.all(
				id.map((containerId) =>
					this.nishikiDbClient.getContainer(containerId.id),
				),
			);
			const containersObject: Container[] = [];

			for (const container of containers) {
				if (container) {
					const containerObject = createContainerObject(container);
					containersObject.push(containerObject);
				}
			}

			return containersObject;
		}

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
			foods: container.foods.map((food) => fromFoodObjectToFoodData(food)),
		});
	}

	/**
	 * Update a container
	 * @param container
	 */
	async update(container: Container): Promise<undefined> {
		await this.nishikiDbClient.saveContainer({
			containerId: container.id.id,
			containerName: container.name,
			foods: container.foods.map((food) => fromFoodObjectToFoodData(food)),
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

const fromFoodObjectToFoodData = (food: Food): FoodData => {
	return {
		foodId: food.id.id,
		name: food.name,
		quantity: food.quantity?.quantity ?? null,
		unit: food.unit?.name ?? null,
		expiry: food.expiry?.date.toISOString() ?? null,
		category: food.category,
		createdAt: food.createdAt.toISOString(),
	};
};

/**
 * Create a container from primitive values.
 * When containerData is invalid, this function throws an error.
 * @param containerData
 * @throws ContainerRepositoryError - this error will be thrown when the data is invalid.
 */
const createContainerObject = (containerData: ContainerData): Container => {
	const containerIdOrErr = ContainerId.create(containerData.containerId);
	const name = containerData.containerName;
	const foods = containerData.foods.map((food) => {
		const foodIdOrErr = ContainerId.create(food.foodId);
		if (foodIdOrErr.err) {
			const report = [
				`ContainerId: ${containerData.containerId}`,
				foodIdOrErr.error.message,
			];
			throw new ContainerRepositoryError(foodIdOrErr.error.message, report);
		}

		const foodId = foodIdOrErr.unwrap();
		const name = food.name;
		const foodProps: IFoodProps = {
			name: name,
			category: food.category,
			createdAt: new Date(food.createdAt),
		};

		if (food.quantity) {
			const quantityOrError = Quantity.create(food.quantity);
			if (quantityOrError.err) {
				const report = [
					`ContainerId: ${containerData.containerId}`,
					quantityOrError.error.message,
				];
				throw new ContainerRepositoryError(
					quantityOrError.error.message,
					report,
				);
			}
			foodProps.quantity = quantityOrError.value;
		}

		if (food.expiry) {
			const date = new Date(food.expiry);
			const expiryOrError = Expiry.create({ date: date });
			if (expiryOrError.err) {
				const report = [
					`ContainerId: ${containerData.containerId}`,
					expiryOrError.error.message,
				];
				throw new ContainerRepositoryError(expiryOrError.error.message, report);
			}
			foodProps.expiry = expiryOrError.value;
		}

		if (food.unit) {
			const unitOrError = Unit.create({ name: food.unit });
			if (unitOrError.err) {
				const report = [
					`ContainerId: ${containerData.containerId}`,
					unitOrError.error.message,
				];
				throw new ContainerRepositoryError(unitOrError.error.message, report);
			}
			foodProps.unit = unitOrError.value;
		}

		const foodOrError = Food.create(foodId, foodProps);
		if (foodOrError.err) {
			const report = [
				`ContainerId: ${containerData.containerId}`,
				foodOrError.error.message,
			];
			throw new ContainerRepositoryError(foodOrError.error.message, report);
		}
		return foodOrError.unwrap();
	});

	if (containerIdOrErr.err) {
		const report = [
			`ContainerId: ${containerData.containerId}`,
			containerIdOrErr.error.message,
		];
		throw new ContainerRepositoryError(containerIdOrErr.error.message, report);
	}

	const containerId = containerIdOrErr.unwrap();
	const containerOrError = Container.create(containerId, {
		name: name,
		foods: foods,
	});
	if (containerOrError.err) {
		const report = [
			`ContainerId: ${containerId}`,
			containerOrError.error.message,
		];
		throw new ContainerRepositoryError(containerOrError.error.message, report);
	}
	return containerOrError.unwrap();
};

class ContainerRepositoryError extends RepositoryError {
	constructor(message: string, report: string | string[]) {
		super("ContainerRepositoryError", message, report);
	}
}
