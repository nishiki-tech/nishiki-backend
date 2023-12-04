import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";
import { REGION } from "src/Settings/Setting";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const keys = () => {
	const accessKeyId = process.env.ACCESS_KEY_ID;
	const secretAccessKey = process.env.SECRET_ACCESS_KEY;

	if (!(accessKeyId && secretAccessKey)) {
		throw new Error("The access key or secret key is not defined");
	}

	return { accessKeyId, secretAccessKey };
};

const dynamoEndpoint = () => {
	if (!process.env.DYNAMO_ENDPOINT) {
		throw new Error("The dynamo endpoint is not defined");
	}
	return process.env.DYNAMO_ENDPOINT;
};

const { accessKeyId, secretAccessKey } = keys();

const dynamoTestConfig: DynamoDBClientConfig = {
	credentials: {
		accessKeyId: accessKeyId,
		secretAccessKey: secretAccessKey,
	},
	region: REGION,
	endpoint: dynamoEndpoint(),
};

export const dynamoTestClient = new DynamoDBClient(dynamoTestConfig);
