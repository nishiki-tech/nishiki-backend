import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { ContainerId } from "./Entities/Container";

export interface IGroupRepository {
	find(id: GroupId): Promise<Group | null>;
	find(id: ContainerId): Promise<Group | null>;
	create(group: Group): Promise<undefined>;
	update(group: Group): Promise<undefined>;
	delete(id: GroupId): Promise<undefined>;
}
