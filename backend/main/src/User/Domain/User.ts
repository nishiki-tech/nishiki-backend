import {AggregateRoot, Entity, Identifier, Ok, Result} from "src/Shared"

export class User extends AggregateRoot<string, IUserProps> {
    static create(id: Identifier<string>, props: IUserProps): Result<User> {
        return Ok(new User(id, props))
    }
}

export class UserId extends Identifier<string> {
    static create(id: string): Result<UserId> {
        return Ok(new UserId(id))
    }
}

interface IUserProps {
    name: string
}
