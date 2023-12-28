import { dynamoClient } from "src/Shared/Adapters/DB/DynamoClient";
import { NishikiDynamoDBClient } from "./NishikiTableClient";
import { UserId } from "src/User";

const nishikiClient = new NishikiDynamoDBClient(
	dynamoClient,
	process.env.TABLE_NAME,
);
export const handler = async (event, context, callback) => {
	console.log("event", event);
	console.log("context", context);
	console.log("callback", callback);
	const userId = UserId.generate();
	const result = await nishikiClient.saveUser({
		userId: userId.id,
		username: event.userName,
		emailAddress: event.request.userAttributes.email,
	});

	callback(null, event);
};
