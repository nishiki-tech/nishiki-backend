import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { ContainerId } from "src/Group/Domain/Entities/Container";

export class MockGroupRepository implements IGroupRepository {
	memoryGroups: Group[] = [];

	async find(id: GroupId): Promise<Group | null> {
		return this.memoryGroups.find((group) => group.id.equal(id)) || null;
	}
	async findByContainerId(containerId: ContainerId): Promise<Group | null> {
		return (
			this.memoryGroups.find((group) => {
				if (group.containerIds.some((id) => id.equal(containerId))) {
					return true;
				}
			}) || null
		);
	}
	async create(group: Group): Promise<undefined> {
		this.memoryGroups.push(group);
	}
	async update(group: Group): Promise<undefined> {
		if (this.memoryGroups.find((el) => el.id.equal(group.id))) {
			this.memoryGroups = this.memoryGroups.map((el) =>
				el.id.equal(group.id) ? group : el,
			);
		}
	}
	async delete(id: GroupId): Promise<undefined> {
		this.memoryGroups = this.memoryGroups.filter((el) => !el.id.equal(id));
	}

	public pushDummyData(group: Group) {
		this.memoryGroups.push(group);
	}
}
