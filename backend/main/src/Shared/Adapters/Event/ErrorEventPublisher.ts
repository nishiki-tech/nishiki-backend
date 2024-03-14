import {
	EventBridgeClient,
	PutEventsCommand,
	PutEventsCommandInput,
	PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";

type ErrorStatusTypes = "CRUCIAL" | "ERROR" | "INFO";

type ErrorStatus = {
	status: ErrorStatusTypes;
	content: string | string[];
};

/**
 * publish events to EventBridge
 * @param errors
 */
export const errorEventPublisher = async (
	errors: ErrorStatus | ErrorStatus[],
) => {
	const client = new EventBridgeClient();

	const entries = Array.isArray(errors)
		? errors.map((error) => toEntry(error))
		: [toEntry(errors)];

	const input: PutEventsCommandInput = {
		Entries: entries,
	};

	const command = new PutEventsCommand(input);

	await client.send(command);
};

/**
 * to the request entry
 * @param detail
 */
const toEntry = (detail: ErrorStatus): PutEventsRequestEntry => {
	return {
		DetailType: "ErrorNotification",
		EventBusName: "ErrorNotificationBus",
		Detail: JSON.stringify({
			status: detail.status,
			content: Array.isArray(detail.content)
				? detail.content.join("\n")
				: detail.content,
		}),
	};
};
