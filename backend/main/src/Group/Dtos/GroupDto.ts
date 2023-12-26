import { Group } from "src/Group/Domain/Entities/Group";

export interface IGroupDto {
	id: string;
	name: string;
	containerIds: string[];
	userIds: string[];
}

export const groupDtoMapper = (group: Group): IGroupDto => {
	return {
		id: group.id.id,
		name: group.name,
		containerIds: group.containerIds.map((el) => el.id),
		userIds: group.userIds.map((el) => el.id),
	};
};
