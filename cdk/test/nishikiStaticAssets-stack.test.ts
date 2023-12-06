import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NishikiStaticAssetsStack } from "../lib/nishikiStaticAssets-stack";
import { App } from "aws-cdk-lib";

describe("Static Assets", () => {
	const app = new App();
	const stack = new NishikiStaticAssetsStack(app, "stack", { stage: "prod" });
	const template = Template.fromStack(stack);

	test("DynamoDB", () => {
		template.resourceCountIs("AWS::DynamoDB::Table", 1);

		template.hasResource("AWS::DynamoDB::Table", {
			UpdateReplacePolicy: "Retain",
			DeletionPolicy: "Retain",
		});

		template.hasResourceProperties("AWS::DynamoDB::Table", {
			TableName: "nishiki-table-prod-db",
			BillingMode: "PAY_PER_REQUEST",
		});

		template.hasResourceProperties("AWS::DynamoDB::Table", {
			AttributeDefinitions: [
				{
					AttributeName: "PK",
					AttributeType: "S",
				},
				{
					AttributeName: "SK",
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
					AttributeType: "S",
				},
				{
					AttributeName: "EMailAddress",
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
		});

		// check GSI
		template.hasResourceProperties("AWS::DynamoDB::Table", {
			GlobalSecondaryIndexes: [
				{
					IndexName: "UserAndGroupRelationship",
					KeySchema: [
						{
							AttributeName: "GroupId",
							KeyType: "HASH",
						},
						{
							AttributeName: "UserId",
							KeyType: "RANGE",
						},
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
				},
				{
					IndexName: "JoinLink",
					KeySchema: [
						{
							AttributeName: "GroupId",
							KeyType: "HASH",
						},
						{
							AttributeName: "LinkExpiredDatetime",
							KeyType: "RANGE",
						},
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
				}, {
					IndexName: "EMailAndUserIdRelationship",
					KeySchema: [
						{
							AttributeName: "EMailAddress",
							KeyType: "HASH",
						}
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
				},
			],
		});
	});
});

describe("dev environment", () => {
	const app = new cdk.App();
	const stack = new NishikiStaticAssetsStack(app, "dev-stack", {
		stage: "dev",
	});
	const template = Template.fromStack(stack);

	template.hasResource("AWS::DynamoDB::Table", {
		UpdateReplacePolicy: "Delete",
		DeletionPolicy: "Delete",
	});

	test("DynamoDB name", () => {
		template.hasResourceProperties("AWS::DynamoDB::Table", {
			TableName: "nishiki-table-dev-db",
		});
	});
});
