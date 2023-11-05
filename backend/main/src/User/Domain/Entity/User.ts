import { AggregateRoot, Err, Identifier, Ok, Result } from "src/Shared";
import { DomainObjectError } from "src/Shared";
import { Username } from "src/User/Domain/ValueObject/Username";

interface IUserProps {
	username: Username;
}

/**
 * This class is the user class.
 */
export class User extends AggregateRoot<string, IUserProps> {

	private constructor(id: UserId, props: IUserProps) {
		super(id, props);
	}

	static create(id: UserId, props: IUserProps): User {
		return new User(id, props);
	}

	get name(): Username {
		return this.props.username;
	}

	/**
	 * change user's name.
	 * @param username
	 * @return User
	 */
	public changeUsername(username: Username): User {
		return new User(this.id, { username });
	}
}

/**
 * This class is the user's ID.
 */
export class UserId extends Identifier<string> {

	private constructor(id: string) {
		super(id);
	}

	/**
	 * User id must be /^[a-z 0-9]{8}-[a-z 0-9]{4}-[a-z 0-9]{4}-[a-z 0-9]{4}-[a-z 0-9]{12}$/
	 * @param id
	 */
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
