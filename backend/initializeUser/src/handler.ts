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

	if (!(response.status === 201 || response.status === 204)) {
		callback(
			new Error(
				`HTTP request failed with status ${response.status}: ${response.statusText}`,
			),
			event,
		);
	}

	callback(null, event);
};
