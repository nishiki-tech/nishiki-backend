import { Callback, Context, PreTokenGenerationTriggerEvent } from "aws-lambda";
import {
	IInitializeUserProps,
	InitializeUserService,
} from "./InitializeUserService";

/**
 * This function is called before a token is generated for a user in the user pool.
 * @param event
 * @param context
 * @param callback
 * @returns
 */
export const handler = async (
	event: PreTokenGenerationTriggerEvent,
	context: Context,
	callback: Callback,
) => {
	const initializeUserProps: IInitializeUserProps = {
		name: event.request.userAttributes.nickname,
		emailAddress: event.request.userAttributes.email,
	};

	const initializeUserService = new InitializeUserService();
	const response = await initializeUserService.execute(initializeUserProps);

	if (!response.ok) {
		callback(
			new Error(
				`HTTP request failed with status ${response.status}: ${response.statusText}`,
			),
			event,
		);
		return;
	}

	console.log(`response status ${response.status}: ${response.statusText}`);
	callback(null, event);
};
