import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { NishikiDynamoDBClient } from "../Shared/Adapters/DB/NishikiTableClient";
import { UserId } from "src/User";
import { Group, GroupId } from "src/Group/Domain/Entities/Group";
import { Container, ContainerId } from "src/Group/Domain/Entities/Container";
import { Callback, Context, PreTokenGenerationTriggerEvent } from "aws-lambda";

const nishikiClient = new NishikiDynamoDBClient(
	dynamoClient,
	process.env.TABLE_NAME,
);
export const handler = async (
	event: PreTokenGenerationTriggerEvent,
	context: Context,
	callback: Callback,
) => {
	console.log("event", event);
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

	callback(null, event);
};
