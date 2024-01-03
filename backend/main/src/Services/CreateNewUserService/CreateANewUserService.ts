import { CreateUserController } from "src/User/Controllers/CreateUserController";
import { CreateContainerController } from "src/Group/Controllers/CreateContainerController";
import { CreateGroupController } from "src/Group/Controllers/CreateGroupController";
import {
	BadRequestStatus,
	Controller,
	ForbiddenStatus,
	InternalServerErrorStatus,
} from "src/Shared";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";

interface ICreateANewUser {
	emailAddress: string;
	name?: string;
}

/**
 * Create a new user, container, and group.
 */
export class CreateANewUserService extends Controller<ICreateANewUser> {
	constructor(
		readonly createUser: CreateUserController,
		readonly createGroup: CreateGroupController,
		readonly createContainer: CreateContainerController,
		readonly nishikiDynamoDBClient: NishikiDynamoDBClient,
	) {
		super();
	}

	async handler(input: ICreateANewUser) {
		// create a new user
		const createUserResult = await this.createUser.execute(input);
		if (!(createUserResult.status === "CREATED" && createUserResult.body)) {
			return createUserResult as BadRequestStatus | InternalServerErrorStatus;
		}
		const userData = createUserResult.body;

		const userId = userData.id;
		const userName = userData.name;

		// crate a new group
		const createGroupResult = await this.createGroup.execute({
			name: `${userName}'s group`,
			userId: userId,
		});

		// when the creating a group failed, delete the user for rollback.
		if (!(createGroupResult.status === "CREATED" && createGroupResult.body)) {
			await this.nishikiDynamoDBClient.deleteUser(userId);
			// TODO: delete group
			return createGroupResult as BadRequestStatus | InternalServerErrorStatus;
		}

		const groupData = createGroupResult.body;

		const groupId = groupData.id;

		// create a new container
		const createContainerResult = await this.createContainer.execute({
			userId,
			name: `${userName}'s container`,
			groupId,
		});

		if (
			!(createContainerResult.status === "CREATED" && createUserResult.body)
		) {
			// TODO: delete user and group.
			await Promise.all([
				this.nishikiDynamoDBClient.deleteUser(userId),
				this.nishikiDynamoDBClient.deleteGroup(groupId),
			]);
			return createContainerResult as
				| BadRequestStatus
				| ForbiddenStatus
				| InternalServerErrorStatus;
		}

		return this.created(undefined);
	}
}
