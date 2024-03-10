import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { Stage } from "../utils";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";

interface IProps extends cdk.StackProps {
	readonly stage: Stage;
	readonly userPool: UserPool;
	readonly table: Table;
}

export class NishikiBackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: IProps) {
		super(scope, id, props);

		const { stage, table, userPool } = props;

		const mainFunction = nishikiMainBackendFunction(this, stage, {
			tableName: table.tableName,
			userPool,
		});

		// add permission to writing and reading of Dynamo DB.
		table.grantReadWriteData(mainFunction);

		const mainFunctionUrl = mainFunction.addFunctionUrl({
			authType: lambda.FunctionUrlAuthType.AWS_IAM,
		});

		const cognitoTriggerFunction = CognitoTriggerFunction(this, stage, {
			lambdaArn: mainFunction.functionArn,
			lambdaUrl: mainFunctionUrl.url,
		});

		// add permission to invoke mainFunction through functionUrl.
		cognitoTriggerFunction.addToRolePolicy(
			new iam.PolicyStatement({
				actions: ["lambda:InvokeFunctionUrl"],
				resources: [mainFunction.functionArn],
			}),
		);

		// add API Gateway
		const api = new apigateway.LambdaRestApi(this, "NishikiApi", {
			restApiName: `nishiki-endpoint-${stage}-api-gateway`,
			handler: mainFunction,
			proxy: true,
			defaultCorsPreflightOptions: {
				allowOrigins:
					stage === "prod"
						? ["http://localhost:3000", "https://nishiki.tech"]
						: ["*"],
			},
			defaultMethodOptions: {
				authorizer: nishikiBackendAPIAuthorizer(this, userPool),
			},
			deployOptions: {
				stageName: `${stage}`,
			},
		});
	}
}

interface ICognitoTriggerFunctionProps {
	lambdaArn: string;
	lambdaUrl: string;
}

const CognitoTriggerFunction = (
	scope: cdk.Stack,
	stage: Stage,
	props: ICognitoTriggerFunctionProps,
): NodejsFunction => {
	// role for lambda:InvokeFunctionUrl for nishikiUserInitialize lambdaFunctionUrl
	const cognitoTriggerFunctionRole = new iam.Role(
		scope,
		"cognitoTriggerFunctionRole",
		{
			assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
		},
	);
	cognitoTriggerFunctionRole.addManagedPolicy(
		iam.ManagedPolicy.fromAwsManagedPolicyName(
			"service-role/AWSLambdaBasicExecutionRole",
		),
	);
	cognitoTriggerFunctionRole.addToPolicy(
		new iam.PolicyStatement({
			actions: ["lambda:InvokeFunctionUrl"],
			resources: [props.lambdaArn],
		}),
	);

	const cognitoTriggerFunction = new lambdaNode.NodejsFunction(
		scope,
		"cognitoTriggerFunction",
		{
			functionName: `nishiki-cognito-trigger-function-${stage}-function`,
			entry: path.join(
				__dirname,
				"../../backend/initializeUser/src/handler.ts",
			),
			projectRoot: "../backend/initializeUser",
			depsLockFilePath: "../backend/initializeUser/package-lock.json",
			handler: "handler",
			runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
			environment: {
				TABLE_NAME: `nishiki-table-${stage}-db`,
				REGION: scope.region,
				LAMBDA_FUNCTION_URL: props.lambdaUrl,
			},
			role: cognitoTriggerFunctionRole,
			timeout: cdk.Duration.seconds(5),
		},
	);

	new cdk.CfnOutput(scope, "mainLambdaARN", {
		value: cognitoTriggerFunction.functionArn,
		exportName: `nishiki-cognito-trigger-function-${stage}`,
	});

	return cognitoTriggerFunction;
};

/**
 * defines API Gateway's authorizer
 * @param scope
 * @param userPool
 */
const nishikiBackendAPIAuthorizer = (scope: Construct, userPool: UserPool) => {
	return new apigateway.CognitoUserPoolsAuthorizer(
		scope,
		"NishikiCognitoAuthorizer",
		{
			cognitoUserPools: [userPool],
		},
	);
};

interface IMainFunctionProps {
	tableName: string;
	userPool: UserPool;
}

/**
 * Generate a main lambda function of Nishiki.
 * @param scope
 * @param stage
 * @param props
 */
const nishikiMainBackendFunction = (
	scope: Construct,
	stage: Stage,
	props: IMainFunctionProps,
): NodejsFunction => {
	const { tableName, userPool } = props;

	const mainFunction = new lambdaNode.NodejsFunction(
		scope,
		"NishikiMainFunction",
		{
			runtime: lambda.Runtime.NODEJS_18_X,
			functionName: `nishiki-main-function-${stage}-function`,
			entry: path.join(__dirname, "../../backend/main/src/handler.ts"),
			handler: "handler",
			projectRoot: path.join(__dirname, "../../backend/main"),
			depsLockFilePath: path.join(
				__dirname,
				"../../backend/main/package-lock.json",
			),
			environment: {
				TABLE_NAME: tableName,
				USER_POOL_ID: userPool.userPoolId,
			},
		},
	);

	// add a permission to remove user data form user pool.
	mainFunction.addToRolePolicy(
		new iam.PolicyStatement({
			actions: [
				"cognito-idp:ListUsers",
				"cognito-idp:AdminDeleteUser"
			],
			resources: [userPool.userPoolArn],
		}),
	);

	return mainFunction;
};
