import { Container } from "src/Group/Domain/Entities/Container";
import { IFoodDto, foodDtoMapper } from "./FoodDto";
import { Group } from "../Domain/Entities/Group";

export interface IContainerWithGroupDto {
	id: string;
	name: string;
	group: string;
	groupName: string;
	foods: IFoodDto[];
}

export const containerWithGroupDtoMapper = (
	container: Container,
	group: Group,
): IContainerWithGroupDto => {
	return {
		id: container.id.id,
		name: container.name,
		group: group.id.id,
		groupName: group.name,
		foods: container.foods.map((el) => foodDtoMapper(el)),
	};
};
