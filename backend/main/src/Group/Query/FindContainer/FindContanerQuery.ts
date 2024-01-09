import { Err, Ok, Result } from "result-ts-type";
import {
	FindContainerQueryErrorType,
	IFindContainerQuery,
	UserIsNotAuthorized,
	InvalidInput,
} from "./IFindContainerUseCase";
import { IQuery } from "src/Shared/Layers/Query/IQuery";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { isValidUUIDV4 } from "src/Shared/Utils/Validator";
import {
	ContainerData,
	GroupData,
} from "src/Shared/Adapters/DB/NishikiDBTypes";

export interface IGetContainerReturnData {
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

const toGetContainerData = (
	container: ContainerData,
	group: GroupData,
): IGetContainerReturnData => {
	return {
		id: container.containerId,
		name: container.containerName,
		group: {
			groupId: group.groupId,
			groupName: group.groupName,
		},
		foods: container.foods.map((el) => ({
			id: el.foodId,
			name: el.name,
			quantity: el.quantity,
			category: el.category,
			unit: el.unit,
			expiry: el.expiry,
			createdAt: el.createdAt,
		})),
	};
};

/**
 * Find a container.
 */
export class FindContainerQuery
	implements
		IQuery<
			IFindContainerQuery,
			IGetContainerReturnData | null,
			FindContainerQueryErrorType
		>
{
	private readonly nishikiDynamoDBClient: NishikiDynamoDBClient;

	constructor(nishikiDynamoDBClient: NishikiDynamoDBClient) {
		this.nishikiDynamoDBClient = nishikiDynamoDBClient;
	}

	public async execute(
		request: IFindContainerQuery,
	): Promise<
		Result<IGetContainerReturnData | null, FindContainerQueryErrorType>
	> {
		const { containerId, userId } = request;

		if (!isValidUUIDV4(containerId)) {
			return Err(new InvalidInput("Container ID is invalid"));
		}

		if (!isValidUUIDV4(userId)) {
			return Err(new InvalidInput("User ID is invalid"));
		}

		// check the user is the member of the group
		const group = await this.nishikiDynamoDBClient.getGroup({ containerId });
		if (!group) {
			return Ok(null);
		}

		// check if the user belong to the target group.
		if (
			!(await this.nishikiDynamoDBClient.getUser({
				userId,
				groupId: group.groupId,
			}))
		) {
			return Err(
				new UserIsNotAuthorized(
					"You are not authorized to access the requested container.",
				),
			);
		}

		const container =
			await this.nishikiDynamoDBClient.getContainer(containerId);

		return Ok(container ? toGetContainerData(container, group) : null);
	}
}
