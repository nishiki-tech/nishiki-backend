import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";
import { REGION } from "src/Settings/Setting";
import {
	CreateTableCommand,
	CreateTableCommandInput,
	DeleteTableCommand,
	DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { __local__ } from "src/Shared/Adapters/DB/NishikiTableClient"

const {
	EMAIL_ADDRESS_RELATION_INDEX_NAME,
	USER_AND_GROUP_RELATIONS,
	INVITATION_LINK_EXPIRY_DATETIME,
	INVITATION_HASH
} = __local__

export const NISHIKI_TEST_TABLE_NAME = "Nishiki-DB";

/**
 * Checking AWS keys which comes from the environment value
 */
const keys = () => {
	const accessKeyId = process.env.ACCESS_KEY_ID;
	const secretAccessKey = process.env.SECRET_ACCESS_KEY;

	if (!accessKeyId) {
		throw new Error("The access key is not provided.");
	}

	if (!secretAccessKey) {
		throw new Error("The secret access key is not provided");
	}

	return { accessKeyId, secretAccessKey };
};

/**
 * The same as the keys, this dynamo DB's endpoint comes from the environment value
 */
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

class TestDynamoDBClient extends DynamoDBClient {
	/**
	 * Create a table for the test.
	 * This table has the same definition as the production's.
	 * @throws - if some errors occur during creation, this function throw error.
	 */
	async createTestTable() {
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
					AttributeName: "LinkExpiredDatetime",
					AttributeType: "S",
				},
				{
					AttributeName: "EMailAddress",
					AttributeType: "S",
				},
				{
					AttributeName: "InvitationHash",
					AttributeType: "S",
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
					IndexName: USER_AND_GROUP_RELATIONS,
					KeySchema: [
						{
							AttributeName: "GroupId",
							KeyType: "HASH",
						},
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
				},
				{
					IndexName: INVITATION_LINK_EXPIRY_DATETIME,
					KeySchema: [
						{
							AttributeName: "LinkExpiryDatetime",
							KeyType: "HASH",
						},
						{
							AttributeName: "SK",
							KeyType: "RANGE",
						},
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
				},
				{
					IndexName: EMAIL_ADDRESS_RELATION_INDEX_NAME,
					KeySchema: [
						{
							AttributeName: "EMailAddress",
							KeyType: "HASH",
						},
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
				},
				{
					IndexName: INVITATION_HASH,
					KeySchema: [
						{
							AttributeName: "InvitationHash",
							KeyType: "HASH",
						}
					],
					Projection: {
						ProjectionType: "INCLUDE",
						NonKeyAttributes: [
							"LinkExpiryDatetime"
						]
					},
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1
					}
				}
			],
			TableName: NISHIKI_TEST_TABLE_NAME,
			ProvisionedThroughput: {
				ReadCapacityUnits: 2,
				WriteCapacityUnits: 2,
			},
			TableClass: "STANDARD",
			DeletionProtectionEnabled: false,
		};

		const command: CreateTableCommand = new CreateTableCommand(input);

		await this.send(command);
	}

	/**
	 * Delete the test table
	 */
	async deleteTestTable() {
		const command = new DeleteTableCommand({
			TableName: NISHIKI_TEST_TABLE_NAME,
		});

		await this.send(command);
	}
}

export const dynamoTestClient = new TestDynamoDBClient(dynamoTestConfig);
