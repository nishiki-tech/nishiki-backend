import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { REGION } from "src/Settings/Setting";

const dynamoConfig = {
	region: REGION,
};

export const dynamoClient = new DynamoDBClient(dynamoConfig);
