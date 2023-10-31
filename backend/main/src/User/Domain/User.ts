import { AggregateRoot, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";

interface IUserProps {
	name: string;
}

/**
 * This class is user class.
 * The name of user must be less than equal to 30 and greater than equal to 1.
 */
export class User extends AggregateRoot<string, IUserProps> {
	static create(id: UserId, props: IUserProps): Result<User, UserDomainError> {
		if (props.name.length < 1) {
			return Err(new UserDomainError("User name is too short"));
		}
		if (props.name.length > 30) {
			return Err(new UserDomainError("User name is too long"));
		}
		return Ok(
			new User(id, {
				...props,
			}),
		);
	}

	get name(): string {
		return this.props.name;
	}

	/**
	 * change user's name.
	 * @param name
	 * @return User
	 */
	public changeUserName(name: string): Result<User, UserDomainError> {
		return User.create(this.id, { name });
	}
}

/**
 * This class is the user's ID.
 */
export class UserId extends Identifier<string> {
	static create(id: string): Result<UserId, UserIdDomainError> {
		const regId =
			/^[a-z 0-9]{8}-[a-z 0-9]{4}-[a-z 0-9]{4}-[a-z 0-9]{4}-[a-z 0-9]{12}$/;

		if (!regId.test(id)) {
			return Err(new UserIdDomainError("Incorrect User ID pattern"));
		}

		return Ok(new UserId(id));
	}
}

export class UserIdDomainError extends DomainObjectError {}
export class UserDomainError extends UserIdDomainError {}
