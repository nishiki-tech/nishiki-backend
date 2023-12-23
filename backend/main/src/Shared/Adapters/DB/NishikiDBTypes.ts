/**
 * The user data model in the DB.
 */
export type UserData = {
	userId: string;
	username: string;
	emailAddress: string;
};

/**
 * Save group's props
 */
export type GroupInput = {
	groupName?: string;
	userIds?: string[];
	containerIds?: string[];
};

/**
 * The group data model in the DB.
 */
export type GroupData = {
	groupId: string;
	groupName: string;
};

/**
 * User and group relations GSI
 * The UserId is also the partition key.
 */
export type UserGroupRelation = {
	userId: string;
	SK: string;
};

/**
 * link expiry Datetime
 * The groupId is also the partition key.
 */
export type InvitationLink = {
	groupId: string; // PK
	SK: string;
	linkExpiryTime: Date;
	invitationLinkHash: string;
};

/**
 * This is a food object structure recorded in the DB.
 */
export type FoodItem = {
    FoodId: string,
    Name: string | null,
    Unit: string | null,
    Quantity: number | null,
    Category: string | null,
    Expiry: string | null,
    CreatedDatetime: string
}

export type Food = {
    foodId: string,
    name: string | null,
    unit: string | null,
    quantity: number | null,
    category: string | null,
    expiry: string | null,
    createdDatetime: string
}

/**
 * container ID is also the partition key.
 */
export type ContainerData = {
	containerId: string,
	containerName: string,
	foods: Food[]
}

export const fromFoodToFoodItem = (food: Food): FoodItem => {
	return {
		FoodId: food.foodId,
		Name: food.name,
		Unit: food.unit,
		Quantity: food.quantity,
		Category: food.category,
		Expiry: food.expiry,
		CreatedDatetime: food.createdDatetime
	}
}
export const fromFoodItemToFood = (food: FoodItem): Food => {
	return {
		foodId: food.FoodId,
		name: food.Name,
		unit: food.Unit,
		quantity: food.Quantity,
		category: food.Category,
		expiry: food.Expiry,
		createdDatetime: food.CreatedDatetime
	}
}
