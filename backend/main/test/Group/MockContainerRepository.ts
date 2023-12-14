import { IContainerRepository } from "src/Group/Domain/IContainerRepository";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";

export class MockContainerRepository implements IContainerRepository {
	memoryContainers: Container[] = [];

	async find(id: ContainerId): Promise<Container | null> {
		return (
			this.memoryContainers.find((container) => {
				if (container.id.equal(id)) return true;
			}) || null
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
