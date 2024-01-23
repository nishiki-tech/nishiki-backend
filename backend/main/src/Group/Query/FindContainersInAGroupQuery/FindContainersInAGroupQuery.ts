import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";
import { ContainerData } from "src/Shared/Adapters/DB/NishikiDBTypes";
import { Ok, Err, Result } from "result-ts-type";
import { QueryError } from "src/Shared/Utils/Errors";

export class FindContainersInAGroupQuery
	implements
		IQuery<{ groupId: string }, IContainerData, InvalidUUId | GroupNotFound>
{
	constructor(private readonly nishikiDynamoDBClient: NishikiDynamoDBClient) {}

	public async execute(input: { groupId: string }): Promise<
		Result<IContainerData, InvalidUUId | GroupNotFound>
	> {
		const { groupId } = input;

		if (!isValidUUIDV4(groupId)) {
			return Err(new InvalidUUId("invalid group ID is provided"));
		}

		const [containerIds, groupData] = await Promise.all([
			this.nishikiDynamoDBClient.listOfContainers(groupId),
			this.nishikiDynamoDBClient.getGroup({ groupId }),
		]);

		if (!groupData) {
			return Err(new GroupNotFound("Requested group is not found"));
		}

		if (containerIds.length === 0) {
			return Ok({ containers: [] });
		}

		const containersResult = await Promise.all(
			containerIds.map((containerId) =>
				this.nishikiDynamoDBClient.getContainer(containerId),
			),
		);

		const containers = containersResult.filter(
			(container) => container,
		) as ContainerData[];

		return Ok({
			containers: containers.map((container) => ({
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
			})),
		});
	}
}

export class InvalidUUId extends QueryError {}
export class GroupNotFound extends QueryError {}

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
