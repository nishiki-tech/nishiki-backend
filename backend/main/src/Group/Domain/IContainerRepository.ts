import { Container, ContainerId } from "src/Group/Domain/Entities/Container";

export interface IContainerRepository {
	find(id: ContainerId): Promise<Container | null>;
	create(container: Container): Promise<undefined>;
	update(container: Container): Promise<undefined>;
	delete(id: ContainerId): Promise<undefined>;
}
