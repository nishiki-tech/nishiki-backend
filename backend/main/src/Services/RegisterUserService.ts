import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { NishikiDynamoDBClient } from "../Shared/Adapters/DB/NishikiTableClient";
import { UserId } from "src/User";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { UserRepository } from "src/User/Repositories/UserRepository";
import { CreateUserController } from "src/User/Controllers/CreateUserController";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { CreateContainerController } from "src/Group/Controllers/CreateContainerController";
import { CreateGroupController } from "src/Group/Controllers/CreateGroupController";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { IGroupDto } from "src/Group/Dtos/GroupDto";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";

const nishikiClient = new NishikiDynamoDBClient(
	dynamoClient,
	process.env.TABLE_NAME,
);
export const handler = async (event, context, callback) => {
	console.log("event", event);
	console.log("context", context);
	console.log("callback", callback);
	const userId = UserId.generate();
	const name = event.userName;
	const emailAddress = event.request.userAttributes.email;
	const result = await nishikiClient.saveUser({
		userId: userId.id,
		username: name,
		emailAddress: emailAddress,
	});

	const containerId = ContainerId.generate();
	const containerOrError = Container.default(containerId);
	if (!containerOrError.ok) {
		return containerOrError.err;
	}
	const container = containerOrError.value;

	const groupId = GroupId.generate();
	const groupOrError = Group.default(groupId);
	if (!groupOrError.ok) {
		return groupOrError.err;
	}
	const group = groupOrError.value;
	const groupResult = await nishikiClient.saveGroup(groupId.id, {
		userIds: [userId.id],
		groupName: group.name,
		containerIds: [container.id.id],
	});

	// const userRepository = new UserRepository();
	// const useCase = new CreateUserUseCase(userRepository);
	// const controller = new CreateUserController(useCase);
	// const userSaveResult = await controller.execute({
	// 	name,
	// 	emailAddress,
	// });
	// const groupIdOrNull = await createInitGroup(userId);
	// if (!groupIdOrNull) {
	// 	return callback(null, event);
	// }
	// const groupId = groupIdOrNull;
	// createInitContainer(userId, groupId);

	// const result = await nishikiClient.saveUser({
	// 	userId: userId.id,
	// 	username: event.userName,
	// 	emailAddress: event.request.userAttributes.email,
	// });

	callback(null, event);
};

// const createInitGroup = async (userId: UserId): Promise<GroupId | null> => {
// 	const createGroupUseCase = new CreateGroupUseCase(groupRepository);
// 	const createGroupController = new CreateGroupController(createGroupUseCase);
// 	const createGroupResult = await createGroupController.execute({
// 		userId: userId.id,
// 	});
// 	if (!createGroupResult.body) {
// 		return null;
// 	}
// 	if (typeof createGroupResult.body === "string") {
// 		return null;
// 	}
// 	const isGroupDto = (value: any): value is IGroupDto => {
// 		if (value.id) {
// 			return true;
// 		}
// 		return false;
// 	};
// 	if (!isGroupDto(createGroupResult.body)) {
// 		return null;
// 	}

// 	const groupIdOrError = GroupId.create(createGroupResult.body?.id);
// 	if (!groupIdOrError.ok) {
// 		return null;
// 	}
// 	const groupId = groupIdOrError.value;

// 	return groupId;
// };

// const createInitContainer = async (userId: UserId, groupId: GroupId) => {
// 	const createContainerUseCase = new CreateContainerUseCase(
// 		containerRepository,
// 		groupRepository,
// 	);
// 	const createContainerController = new CreateContainerController(
// 		createContainerUseCase,
// 	);
// 	const result = await createContainerController.execute({
// 		userId: userId.id,
// 		groupId: groupId.id,
// 	});
// };
