import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { AggregateRoot, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { User, UserId } from "src/User";

interface IGroupProps {
	name: string;
	containers: Container[];
	users: User[];
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

	get containers(): Container[] {
		return this.props.containers;
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
	 * Add container object to the group.
	 * If the container object already exists in the group, return error.
	 * @param container
	 */
	public addContainer(container: Container): Result<Group, GroupDomainError> {
		const matchedContainer = this.props.containers.find(
			(c) => c.id === container.id,
		);
		if (matchedContainer !== undefined) {
			return Err(
				new GroupDomainError(
					"The container object already exists in the group",
				),
			);
		}

		const containers = [...this.props.containers, container];
		return Group.create(this.id, {
			...this.props,
			containers: containers,
		});
	}

	/**
	 * Remove container object from the group.
	 * If the container object doesn't exist in the group, return error.
	 * @param containerId
	 */
	public removeContainer(
		containerId: ContainerId,
	): Result<Group, GroupDomainError> {
		const containers = this.props.containers.filter(
			(f) => f.id !== containerId,
		);
		if (containers.length === this.props.containers.length) {
			return Err(
				new GroupDomainError("The container object doesn't exist in the group"),
			);
		}

		return Group.create(this.id, {
			...this.props,
			containers: containers,
		});
	}

	/**
	 * Add user object to the group.
	 * If the user object already exists in the group, return error.
	 * @param user
	 */
	public addUser(user: User): Result<Group, GroupDomainError> {
		const matchedUser = this.props.users.find((u) => u.id === user.id);
		if (matchedUser !== undefined) {
			return Err(
				new GroupDomainError("The user object already exists in the group"),
			);
		}

		const users = [...this.props.users, user];
		return Group.create(this.id, {
			...this.props,
			users: users,
		});
	}

	/**
	 * Remove user object from the group.
	 * If the user object doesn't exist in the group, return error.
	 * @param userId
	 */
	public removeUser(userId: UserId): Result<Group, GroupDomainError> {
		const users = this.props.users.filter((f) => f.id !== userId);
		if (users.length === this.props.users.length) {
			return Err(
				new GroupDomainError("The user object doesn't exist in the group"),
			);
		}

		return Group.create(this.id, {
			...this.props,
			users: users,
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
