import { DomainObjectError, ValueObject } from "src/Shared";
import { Err, Ok, Result } from "result-ts-type";

const DEFAULT_NAME = "Nishiki User";

interface IUserNameProps {
	name: string;
}

/**
 * The Username value object.
 */
export class Username extends ValueObject<IUserNameProps> {
	get name(): string {
		return this.props.name;
	}

	/**
	 * change username
	 * @param name
	 */
	public changeName(name: string): Result<Username, UserNameDomainError> {
		return Username.create(name);
	}

	/**
	 * The username length must be less than equal to 30 and greater than equal to 1.
	 * Also, if the username is not provided, the username is set to the default name, Nishiki User.
	 * @param name
	 */
	static create(name?: string): Result<Username, UserNameDomainError> {
		// return default name
		if (name !== "" && !name) return Ok(new Username({ name: DEFAULT_NAME }));

		if (name.length < 1) {
			return Err(new UserNameDomainError("Username is too short"));
		}

		if (name.length > 30) {
			return Err(new UserNameDomainError("Username is too long"));
		}

		return Ok(new Username({ name }));
	}
}

export class UserNameDomainError extends DomainObjectError {}
