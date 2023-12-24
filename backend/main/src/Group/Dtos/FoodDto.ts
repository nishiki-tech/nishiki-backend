import { Food } from "src/Group/Domain/Entities/Food";

export interface IFoodDto {
	name: string;
	unit?: string;
	quantity?: number;
	expiry?: Date;
	category: string;
}

export const foodDtoMapper = (food: Food): IFoodDto => {
	return {
		name: food.name,
		unit: food.unit?.name,
		quantity: food.quantity?.quantity,
		expiry: food.expiry?.date,
		category: food.category,
	};
};
