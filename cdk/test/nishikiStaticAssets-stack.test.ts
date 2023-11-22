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

		template.hasResourceProperties("AWS::DynamoDB::Table", {
			TableName: "NishikiTable",
			BillingMode: "PAY_PER_REQUEST",
			AttributeDefinitions: [
				{
					AttributeName: "PK",
					AttributeType: "S",
				},
				{
					AttributeName: "SK",
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
	});
});

describe("dev environment", () => {
	const app = new cdk.App();
	const stack = new NishikiStaticAssetsStack(app, "dev-stack", {
		stage: "dev",
	});
	const template = Template.fromStack(stack);

	test("DynamoDB name", () => {
		template.hasResourceProperties("AWS::DynamoDB::Table", {
			TableName: "NishikiTable-dev",
		});
	});
});
