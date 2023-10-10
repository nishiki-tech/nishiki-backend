import {AggregateRoot, Identifier, Ok, Result, Err} from "src/Shared"
import {DomainObjectError} from "src/Shared";

interface IUserProps {
    name: string,
    isAdmin: boolean
}

interface IUserPropsInput extends Omit<IUserProps, "isAdmin"> {
    isAdmin?: boolean
}

export class User extends AggregateRoot<string, IUserProps> {

    // username must be shorter than 100.
    static create(id: UserId, props: IUserPropsInput): Result<User, UserDomainError> {
        if (props.name.length > 100) {
            return Err(new UserDomainError("User name is too long"))
        }
        return Ok(new User(id, {
            ...props,
            isAdmin: props.isAdmin || false
        }))
    }

    get name(): string {
        return this.props.name
    }

    get isAdmin(): boolean {
        return this.props.isAdmin
    }

    public changeUserName(name: string): User {
        return new User(this.id, {
            name,
            isAdmin: false
        });
    }
}

export class UserId extends Identifier<string> {
    static create(id: string): Result<UserId, UserIdDomainError> {

        return Ok(new UserId(id))
    }
}

export class UserIdDomainError extends DomainObjectError {}
export class UserDomainError extends UserIdDomainError {}
