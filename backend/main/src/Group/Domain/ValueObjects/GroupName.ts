import { DomainObjectError, Err, Ok, Result, ValueObject } from "src/Shared";

const DEFAULT_NAME = "Nishiki Group";

interface IGroupNameProps {
	name: string;
}

/**
 * The GroupName value object.
 */
export class GroupName extends ValueObject<IGroupNameProps> {
	get name(): string {
		return this.props.name;
	}

	/**
	 * change GroupName
	 * @param name
	 */
	public changeName(name: string): Result<GroupName, GroupNameDomainError> {
		return GroupName.create(name);
	}

	/**
	 * The GroupName length must be less than equal to 255 and greater than equal to 1.
	 * Also, if the GroupName is not provided, the GroupName is set to the default name, Nishiki User.
	 * @param name
	 */
	static create(name?: string): Result<GroupName, GroupNameDomainError> {
		// return default name
		if (name !== "" && !name) return Ok(new GroupName({ name: DEFAULT_NAME }));

		if (name.length < 1) {
			return Err(new GroupNameDomainError("GroupName is too short"));
		}

		if (name.length > 255) {
			return Err(new GroupNameDomainError("GroupName is too long"));
		}

		return Ok(new GroupName({ name }));
	}
}

export class GroupNameDomainError extends DomainObjectError {}
