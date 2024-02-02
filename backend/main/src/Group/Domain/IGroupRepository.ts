import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { ContainerId } from "./Entities/Container";

export interface IGroupRepository {
	find(id: GroupId): Promise<Group | null>;
	find(id: ContainerId): Promise<Group | null>;
	create(group: Group): Promise<undefined>;
	update(group: Group): Promise<undefined>;

	/**
	 * Once, this method is called, the group is deleted from the database.
	 * And the containers and the invitation link belonging to the group are also deleted.
	 * And the users' relation to the group is also deleted.
	 * @param id
	 */
	delete(id: GroupId): Promise<undefined>;
}
