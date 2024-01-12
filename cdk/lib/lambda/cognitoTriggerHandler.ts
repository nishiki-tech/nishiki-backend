import { Callback, Context, PreTokenGenerationTriggerEvent } from "aws-lambda";

export const handler = async (
	event: PreTokenGenerationTriggerEvent,
	context: Context,
	callback: Callback,
) => {
	console.log("event", event);

	callback(null, event);
};
