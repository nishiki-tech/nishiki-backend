import {
	DynamoDBClient,
	CreateTableCommand,
	CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";

const config: DynamoDBClientConfig = {
	region: process.env.AWS_REGION,
	endpoint: process.env.DYNAMO_ENDPINT!,
};

const client = new DynamoDBClient(config);

const input: CreateTableCommandInput = {
	AttributeDefinitions: [
		{
			AttributeName: "SK",
			AttributeType: "S",
		},
		{
			AttributeName: "PK",
			AttributeType: "S",
		},
	],
	KeySchema: [
		{
			AttributeName: "PK",
			KeyType: "HASH",
		},
		{
			AttributeName: "SK",
			KeyType: "RANGE",
		},
	],
	TableName: "Nishiki-DB",
	ProvisionedThroughput: {
		ReadCapacityUnits: 2,
		WriteCapacityUnits: 2,
	},
	TableClass: "STANDARD",
	DeletionProtectionEnabled: true,
};

const command = new CreateTableCommand(input);

const runCommand = async () => {
	let retry_limit = 3;

	while (retry_limit > 0) {
		try {
			const req = await client.send(command)
			console.log(req);
			break;
		} catch(err) {
			console.error(err);

			retry_limit--;

			await new Promise(() => setTimeout(() => {}, 1000));

			console.log(`retrying...`);

			if (retry_limit === 0) {
				if (err instanceof Error) {
					throw err;
				}

				if (typeof err === "string") {
					throw Error(err);
				}

				console.error("initializing failed")
			}
		}
	}
}

// run async function
runCommand().then().catch();
