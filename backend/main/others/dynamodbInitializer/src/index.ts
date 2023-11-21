import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput } from  '@aws-sdk/client-dynamodb';
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";

const config: DynamoDBClientConfig = {
    region: process.env.AWS_REGION,
    endpoint: process.env.DYNAMO_ENDPINT!
}

const client = new DynamoDBClient(config);

const input: CreateTableCommandInput = {
    AttributeDefinitions: [
        {
            AttributeName: "SK",
            AttributeType: "S"
        }, {
            AttributeName: "PK",
            AttributeType: "S"
        }
    ],
    KeySchema: [
        {
            AttributeName: "PK",
            KeyType: "HASH"
        }, {
            AttributeName: "SK",
            KeyType: "RANGE"
        }
    ],
    TableName: "Nishiki-DB",
    ProvisionedThroughput: {
        ReadCapacityUnits: 2,
        WriteCapacityUnits: 2
    },
    TableClass: "STANDARD",
    DeletionProtectionEnabled: true
}

const command = new CreateTableCommand(input);

client.send(command)
    .then((req) => {
        console.log(req);
    })
    .catch((err) => {
        console.error(err);
    })
