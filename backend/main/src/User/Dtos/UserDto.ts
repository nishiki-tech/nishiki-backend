import { User } from "src/User/Domain/User";

export interface IUserDto {
	id: string;
	name: string;
	isAdmin: boolean;
}

export const userDtoMapper = (user: User): IUserDto => {
	return {
		id: user.id.id,
		name: user.name,
		isAdmin: user.isAdmin,
	};
};
