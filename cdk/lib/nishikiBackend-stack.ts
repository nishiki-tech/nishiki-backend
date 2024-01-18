import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
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
		});

		// add permission to writing and reading of Dynamo DB.
		table.grantReadWriteData(mainFunction);

		// add API Gateway
		const api = new apigateway.LambdaRestApi(this, "NishikiApi", {
			restApiName: `nishiki-endpoint-${stage}-api-gateway`,
			handler: mainFunction,
			proxy: true,
			defaultMethodOptions: {
				authorizer: nishikiBackendAPIAuthorizer(this, userPool),
			},
			deployOptions: {
				stageName: `${stage}`,
			},
		});
	}
}

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
	const { tableName } = props;

	return new lambdaNode.NodejsFunction(scope, "NishikiMainFunction", {
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
		},
	});
};
