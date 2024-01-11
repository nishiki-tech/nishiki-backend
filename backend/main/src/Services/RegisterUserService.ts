import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { NishikiDynamoDBClient } from "../Shared/Adapters/DB/NishikiTableClient";
import { Callback, Context, PreTokenGenerationTriggerEvent } from "aws-lambda";
import { CreateANewUserService } from "./CreateNewUserService/CreateANewUserService";
import { CreateUserUseCase } from "src/User/UseCases/CreateUserUseCase/CreateUserUseCase";
import { CreateGroupUseCase } from "src/Group/UseCases/CreateGroupUseCase/CreateGroupUseCase";
import { CreateContainerUseCase } from "src/Group/UseCases/CreateContainerUseCase/CreateContainerUseCase";
import { GroupRepository } from "src/Group/Repositories/GroupRepository";
import { UserRepository } from "src/User/Repositories/UserRepository";
import { ContainerRepository } from "src/Group/Repositories/ContainerRepository";

const nishikiClient = new NishikiDynamoDBClient(
	dynamoClient,
	process.env.TABLE_NAME,
);
const groupRepository = new GroupRepository();
const containerRepository = new ContainerRepository();
const userRepository = new UserRepository();
export const handler = async (
	event: PreTokenGenerationTriggerEvent,
	context: Context,
	callback: Callback,
) => {
	console.log("event", event);
	const name = event.request.userAttributes.nickname;
	const emailAddress = event.request.userAttributes.email;
	const createUser = new CreateUserUseCase(userRepository);
	const createGroup = new CreateGroupUseCase(groupRepository);
	const createContainer = new CreateContainerUseCase(
		containerRepository,
		groupRepository,
	);
	const controller = new CreateANewUserService(
		createUser,
		createGroup,
		createContainer,
		groupRepository,
		nishikiClient,
	);

	const result = await controller.execute({
		emailAddress: emailAddress,
		name: name,
	});

	if (result.statusCode !== 201) {
		// throw new Error(
		// 	`Failed to create a new user. statusCode:${result.statusCode}, body:${result?.body}`,
		// );
		callback(new Error("Failed to create a new user."));
	}

	callback(null, event);
};
