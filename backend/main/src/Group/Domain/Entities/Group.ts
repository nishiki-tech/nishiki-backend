import { ContainerId } from "src/Group/Domain/Entities/Container";
import { AggregateRoot, Identifier } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { UserId } from "src/User";
import { Err, Ok, Result } from "result-ts-type";


interface IGroupProps {
	name: string;
	containerIds: ContainerId[];
	userIds: UserId[];
}

/**
 * This class is group class.
 * The name of group must be shorter than equal to 255 and greater than equal 1.
 */
export class Group extends AggregateRoot<string, IGroupProps> {
	static create(
		id: GroupId,
		props: IGroupProps,
	): Result<Group, GroupDomainError> {
		if (props.name.length < 1) {
			return Err(new GroupDomainError("Group name is too short"));
		}
		if (props.name.length > 255) {
			return Err(new GroupDomainError("Group name is too long"));
		}
		return Ok(
			new Group(id, {
				...props,
			}),
		);
	}

	get name(): string {
		return this.props.name;
	}

	get containerIds(): ContainerId[] {
		return this.props.containerIds;
	}

	/**
	 * Change the name of group.
	 * @param name
	 */
	public changeName(name: string): Result<Group, GroupDomainError> {
		return Group.create(this.id, {
			...this.props,
			name: name,
		});
	}

	/**
	 * Add containerId to the group.
	 * If the containerId already exists in the group, return error.
	 * @param container
	 */
	public addContainerId(containerId: ContainerId): Result<Group, GroupDomainError> {
		const matchedContainerId = this.props.containerIds.find(
			(cid) => cid.equal(containerId) === true,
		);

		if (matchedContainerId !== undefined) {
			return Err(
				new GroupDomainError(
					"The containerId already exists in the group",
				),
			);
		}

		const containerIds = [...this.props.containerIds, containerId];
		return Group.create(this.id, {
			...this.props,
			containerIds: containerIds,
		});
	}

	/**
	 * Remove containerId from the group.
	 * If the containerId doesn't exist in the group, return error.
	 * @param containerId
	 */
	public removeContainerId(
		containerId: ContainerId,
	): Result<Group, GroupDomainError> {
		const containerIds = this.props.containerIds.filter((uid) => uid.equal(containerId)!==true);
		console.log("containerIds",containerId);
		console.log("this.props",this.props.containerIds);
		if (containerIds.length === this.props.containerIds.length) {
			return Err(
				new GroupDomainError("The containerId doesn't exist in the group"),
			);
		}

		return Group.create(this.id, {
			...this.props,
			containerIds: containerIds,
		});
	}

	/**
	 * Add userId to the group.
	 * If the userId already exists in the group, return error.
	 * @param user
	 */
	public addUserId(userId: UserId): Result<Group, GroupDomainError> {
		const matchedUserId = this.props.userIds.find((uid) => uid.equal(userId));
		if (matchedUserId !== undefined) {
			return Err(
				new GroupDomainError("The userId already exists in the group"),
			);
		}

		const userIds = [...this.props.userIds, userId];
		return Group.create(this.id, {
			...this.props,
			userIds: userIds,
		});
	}

	/**
	 * Remove userId from the group.
	 * If the userId doesn't exist in the group, return error.
	 * @param userId
	 */
	public removeUserId(userId: UserId): Result<Group, GroupDomainError> {
		const userIds = this.props.userIds.filter((uid) => uid.equal(userId));
		if (userIds.length === this.props.userIds.length) {
			return Err(
				new GroupDomainError("The userId doesn't exist in the group"),
			);
		}

		return Group.create(this.id, {
			...this.props,
			userIds: userIds,
		});
	}
}

/**
 * This class is the group's ID.
 */
export class GroupId extends Identifier<string> {
	static create(id?: string): Result<GroupId, GroupIdDomainError> {
		if (id) {
			return Ok(new GroupId(id));
		}
		// todo: generate uuid
		const groupId = "dummy-group-id";
		return Ok(new GroupId(groupId));
	}
}

export class GroupIdDomainError extends DomainObjectError {}
export class GroupDomainError extends GroupIdDomainError {}
