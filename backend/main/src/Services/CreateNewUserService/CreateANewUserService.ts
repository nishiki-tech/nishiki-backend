import { Controller } from "src/Shared";
import { NishikiDynamoDBClient } from "src/Shared/Adapters/DB/NishikiTableClient";
import { IGroupRepository } from "src/Group/Domain/IGroupRepository";
import { GroupId } from "src/Group/Domain/Entities/Group";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { UserId } from "src/User";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";

interface ICreateANewUser {
	emailAddress: string;
	name?: string;
}

/**
 * Create a new user, container, and group.
 */
export class CreateANewUserService extends Controller<ICreateANewUser> {
	constructor(
		readonly createUser: CreateUserUseCase,
		readonly createGroup: CreateGroupUseCase,
		readonly createContainer: CreateContainerUseCase,
		readonly groupRepository: IGroupRepository,
		readonly nishikiDynamoDBClient: NishikiDynamoDBClient,
	) {
		super();
	}

	async handler(input: ICreateANewUser) {
		const existingUser = await this.nishikiDynamoDBClient.getUserIdByEmail(
			input.emailAddress,
		);

		if (existingUser) {
			return this.badRequest("The email address is already registered.");
		}

		// create a new user
		const createUserResult = await this.createUser.execute(input);

		if (createUserResult.err) {
			return this.badRequest(createUserResult.error.message);
		}

		const userData = createUserResult.value;

		const userIdOrError = UserId.create(userData.id);
		const userName = userData.name;

		if (userIdOrError.err) {
			console.error("[Service Error]: the generated user ID is incorrect.");
			console.error(`[Service Error]: Incorrect user ID is ${userData.id}.`);
			return this.internalServerError();
		}

		const userId = userIdOrError.value;

		// create a new group
		const createGroupResult = await this.createGroup.execute({
			name: `${userName}'s group`,
			userId: userId.id,
		});

		// when the creating a group failed, delete the user for rollback.
		if (createGroupResult.err) {
			// remove the user data from the DB.
			await this.nishikiDynamoDBClient.deleteUser(userId.id);

			return this.badRequest(createGroupResult.error.message);
		}

		const groupData = createGroupResult.value;

		const groupIdOrErr = GroupId.create(groupData.id);

		// normally, the groupId should be created successfully.
		// if it is an error, it means that we must repair the DB data.
		if (groupIdOrErr.err) {
			await this.nishikiDynamoDBClient.deleteUser(userId.id);
			console.error("[Service Error]: the generated group ID is incorrect.");
			console.error(`[Service Error]: In correct group ID ${groupData.id}.`);
			return this.internalServerError();
		}

		const groupId = groupIdOrErr.value;

		// create a new container
		const createContainerResult = await this.createContainer.execute({
			userId: userId.id,
			name: `${userName}'s container`,
			groupId: groupId.id,
		});

		if (createContainerResult.err) {
			// remove the user data and group data from the DB.
			await Promise.all([
				this.nishikiDynamoDBClient.deleteUser(userId.id),
				this.groupRepository.delete(groupId),
			]);

			// This return type suggested that a 'forbidden' error can occur.
			// But, in this case, it can ignore.
			// It error come from missing user, but this case, this method register the user beforehand.
			return this.badRequest(createContainerResult.error.message);
		}

		return this.created(undefined);
	}
}
