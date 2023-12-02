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
		{
			AttributeName: "GroupId",
			AttributeType: "S",
		},
		{
			AttributeName: "UserId",
			AttributeType: "S",
		},
		{
			AttributeName: "LinkExpiredDatetime",
			AttributeType: "S"
		}
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
	GlobalSecondaryIndexes: [
		{
			IndexName: "UserAndGroupRelations",
			KeySchema: [
				{
					AttributeName: "GroupId",
					KeyType: "HASH"
				},
				{
					AttributeName: "UserId",
					KeyType: "RANGE"
				}
			],
			Projection: {
				ProjectionType: "KEYS_ONLY"
			},
			ProvisionedThroughput: {
				ReadCapacityUnits: 1,
				WriteCapacityUnits: 1,
			}
		},
		{
			IndexName: "JoinLink",
			KeySchema: [
				{
					AttributeName: "GroupId",
					KeyType: "HASH"
				},
				{
					AttributeName: "LinkExpiredDatetime",
					KeyType: "RANGE"
				}
			],
			Projection: {
				ProjectionType: "KEYS_ONLY"
			},
			ProvisionedThroughput: {
				ReadCapacityUnits: 1,
				WriteCapacityUnits: 1,
			}
		}
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

client
	.send(command)
	.then((req) => {
		console.log(req);
	})
	.catch((err) => {
		console.error(err);
		throw Error("initializing table failed.")
	});
