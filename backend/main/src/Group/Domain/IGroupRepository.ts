import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { ContainerId } from "./Entities/Container";

export interface IGroupRepository {
	find(id: GroupId): Promise<Group | null>;
	findByContainerId(containerId: ContainerId): Promise<Group | null>;
	create(container: Group): Promise<undefined>;
	update(container: Group): Promise<undefined>;
	delete(id: GroupId): Promise<undefined>;
}
