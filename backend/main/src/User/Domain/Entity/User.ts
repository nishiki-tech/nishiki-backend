import { AggregateRoot, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { UserName } from "src/User/Domain/ValueObject/UserName";

interface IUserProps {
	userName: UserName;
}

/**
 * This class is user class.
 * The name of user must be less than equal to 30 and greater than equal to 1.
 */
export class User extends AggregateRoot<string, IUserProps> {
	static create(id: UserId, props: IUserProps): User {
		return new User(id, props);
	}

	/**
	 * If the username is not provided, return default name "Nishiki User".
	 * @param name
	 * @private
	 */
	private static defaultUserName(name?: string): string {
		return name ? name : "Nishiki User";
	}

	get name(): UserName {
		return this.props.userName;
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
