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
					AttributeName: "InvitationLinkHash",
					AttributeType: "S",
				},
				{
					AttributeName: "EMailAddress",
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
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
				},
				{
					IndexName: "InvitationHash",
					KeySchema: [
						{
							AttributeName: "InvitationLinkHash",
							KeyType: "HASH",
						},
					],
					Projection: {
						ProjectionType: "INCLUDE",
						NonKeyAttributes: ["LinkExpiryDatetime"],
					},
				},
				{
					IndexName: "EMailAndUserIdRelationship",
					KeySchema: [
						{
							AttributeName: "EMailAddress",
							KeyType: "HASH",
						},
					],
					Projection: {
						ProjectionType: "KEYS_ONLY",
					},
				},
			],
		});
	});

	test("Cognito", () => {
		// Assert it creates the user pool with the correct Schema properties
		template.hasResourceProperties("AWS::Cognito::UserPool", {
			UserPoolName: "nishiki-users-prod-user-pool",
			Schema: [{ Mutable: true, Name: "email", Required: true }],
		});

		// Assert it creates the user pool client with the correct SupportedIdentityProviders properties
		// TODO: This should be passed.
		// template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
		// 	SupportedIdentityProviders: ["Google"],
		// });
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

	test("Cognito name", () => {
		template.hasResourceProperties("AWS::Cognito::UserPool", {
			UserPoolName: "nishiki-users-dev-user-pool",
		});
	});
});
