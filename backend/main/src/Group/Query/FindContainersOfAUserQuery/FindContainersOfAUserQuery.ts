import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import {
	ContainerData,
	UsersGroup,
} from "src/Shared/Adapters/DB/NishikiDBTypes";
import { Ok, Err, Result } from "result-ts-type";
import { QueryError } from "src/Shared/Utils/Errors";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";

export class FindContainersOfAUserQuery
	implements IQuery<{ userId: string }, IContainerData, InvalidUUId>
{
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { userId: string }): Promise<
		Result<IContainerData, InvalidUUId>
	> {
		const { userId } = input;
		if (isValidUUIDV4(userId)) {
			return Err(new InvalidUUId("User ID is invalid"));
		}

		const userGroups =
			await this.nishikiDynamoDBClient.listOfUsersGroup(userId);

		if (userGroups.length === 0) {
			return Ok({ containers: [] });
		}

		const groupContainerDetailsList = (
			await Promise.all(
				userGroups.map(async (userGroup) => {
					return await this.getGroupContainerDetails(userGroup);
				}),
			)
		).flat();

		return Ok({ containers: groupContainerDetailsList });
	}

	private async getGroupContainerDetails(
		userGroup: UsersGroup,
	): Promise<IContainer[]> {
		const [groupData, containerIds] = await Promise.all([
			this.nishikiDynamoDBClient.getGroup({
				groupId: userGroup.groupId,
			}),
			this.nishikiDynamoDBClient.listOfContainers(userGroup.groupId),
		]);

		if (!groupData) {
			return [];
		}
		if (containerIds.length === 0) {
			return [];
		}

		const containersResult = await Promise.all(
			containerIds.map((containerId) =>
				this.nishikiDynamoDBClient.getContainer(containerId),
			),
		);

		const containers = containersResult.filter(
			(container) => container !== null,
		) as ContainerData[];

		return containers.map((container) => {
			return {
				id: container.containerId,
				name: container.containerName,
				group: {
					groupId: groupData.groupId,
					groupName: groupData.groupName,
				},
				foods: container.foods.map((food) => ({
					id: food.foodId,
					name: food.name,
					unit: food.unit,
					quantity: food.quantity,
					category: food.category,
					expiry: food.expiry,
					createdAt: food.createdAt,
				})),
			};
		});
	}
}

export class InvalidUUId extends QueryError {}

export interface IContainerData {
	containers: IContainer[];
}

interface IContainer {
	id: string;
	name: string;
	group: {
		groupId: string;
		groupName: string;
	};
	foods: {
		id: string;
		name: string;
		quantity: number | null;
		category: string;
		unit: string | null;
		expiry: string | null;
		createdAt: string;
	}[];
}
