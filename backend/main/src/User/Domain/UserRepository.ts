import {User, UserId} from "src/User/Domain/User";

export interface IUserRepository {
    find(id: UserId): Promise<User | null>
    create(user: User): Promise<undefined>
    update(user: User): Promise<undefined>
    delete(user: UserId): Promise<undefined>
}