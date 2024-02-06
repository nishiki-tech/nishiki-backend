import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { ContainerData } from "src/Shared/Adapters/DB/NishikiDBTypes";
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

		const containersOfUser: IContainerData = { containers: [] };

		for (const userGroup of userGroups) {
			const [containerIds, groupData] = await Promise.all([
				this.nishikiDynamoDBClient.listOfContainers(userGroup.groupId),
				this.nishikiDynamoDBClient.getGroup({ groupId: userGroup.groupId }),
			]);
			if (!groupData) {
				continue;
			}
			if (containerIds.length === 0) {
				continue;
			}

			const containersResult = await Promise.all(
				containerIds.map((containerId) =>
					this.nishikiDynamoDBClient.getContainer(containerId),
				),
			);

			const containers = containersResult.filter(
				(container) => container,
			) as ContainerData[];

			for (const container of containers) {
				containersOfUser.containers.push({
					id: container.containerId,
					name: container.containerName,
					group: {
						userId: userId,
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
				});
			}
		}
		return Ok(containersOfUser);
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
		userId: string;
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
