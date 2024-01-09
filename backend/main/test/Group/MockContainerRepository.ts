import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";

export class MockContainerRepository implements IContainerRepository {
	memoryContainers: Container[] = [];

	async find(id: ContainerId): Promise<Container | null>;
	async find(id: ContainerId[]): Promise<Container[]>;
	async find(
		id: ContainerId | ContainerId[],
	): Promise<Container | Container[] | null> {
		// if the ID is array.
		if (Array.isArray(id)) {
			const containers = await Promise.all(
				id.map((containerId) =>
					this.memoryContainers.find((container) =>
						container.id.equal(containerId),
					),
				),
			);
			const containersArray: Container[] = [];
			if (!containers) {
				return [];
			}

			for (const container of containers) {
				if (container) {
					const containerObject = container;
					containersArray.push(containerObject);
				}
			}

			return containersArray;
		}
		return (
			this.memoryContainers.find((container) => container.id.equal(id)) || null
		);
	}
	async create(container: Container): Promise<undefined> {
		this.memoryContainers.push(container);
	}
	async update(container: Container): Promise<undefined> {
		if (this.memoryContainers.find((el) => el.id.equal(container.id))) {
			this.memoryContainers = this.memoryContainers.map((el) =>
				el.id.equal(container.id) ? container : el,
			);
		}
	}
	async delete(id: ContainerId): Promise<undefined> {
		this.memoryContainers = this.memoryContainers.filter(
			(el) => !el.id.equal(id),
		);
	}

	public pushDummyData(container: Container) {
		this.memoryContainers.push(container);
	}
}
