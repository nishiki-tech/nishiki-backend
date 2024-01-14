import { Callback, Context, PreTokenGenerationTriggerEvent } from "aws-lambda";
import { InitializeUserService } from "./InitializeUserService";
export const handler = async (
	event: PreTokenGenerationTriggerEvent,
	context: Context,
	callback: Callback,
) => {
	console.log("event", event);

	const postData = {
		name: event.request.userAttributes.nickname,
		emailAddress: event.request.userAttributes.email,
	};

	const initializeUserService = new InitializeUserService();
	const response = await initializeUserService.execute(postData);

	// Ensure the request was successful
	if (!response.ok) {
		throw new Error(`HTTP request failed with status ${response.status}`);
	}

	// Process the response if needed
	const responseBody = await response.json();
	console.log(
		"lambdaFunction response:",
		JSON.stringify(responseBody, null, 2),
	);

	callback(null, event);
};
