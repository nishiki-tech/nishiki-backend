import {AggregateRoot, Entity, Identifier, Ok, Result, Err} from "src/Shared"
import {DomainObjectError} from "src/Shared";

interface IUserProps {
    name: string
}

export class User extends AggregateRoot<string, IUserProps> {

    // username must be shorter than 100.
    static create(id: Identifier<string>, props: IUserProps): Result<User, UserDomainError> {
        if (props.name.length > 100) {
            return Err(new UserDomainError("User name is too long"))
        }
        return Ok(new User(id, props))
    }

    get name(): string {
        return this.props.name
    }

    public changeUserName(name: string): User {
        return new User(this.id, { name });
    }
}

export class UserId extends Identifier<string> {
    static create(id: string): Result<UserId, UserIdDomainError> {

        return Ok(new UserId(id))
    }
}

export class UserIdDomainError extends DomainObjectError {}
export class UserDomainError extends UserIdDomainError {}
