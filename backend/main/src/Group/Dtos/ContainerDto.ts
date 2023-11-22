import { Container } from "src/Group/Domain/Entities/Container";

export interface IContainerDto {
	id: string;
	name: string;
	foods: object[];
}

export const containerDtoMapper = (container: Container): IContainerDto => {
	return {
		id: container.id.id,
		name: container.name,
		foods: container.foods,
	};
};
