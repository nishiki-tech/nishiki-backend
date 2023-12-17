import * as cdk from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { Stage } from "../utils";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface IProps extends cdk.StackProps {
	readonly stage: Stage;
	readonly api: RestApi;
	readonly userPool: UserPool;
	readonly table: Table;
}

export class NishikiBackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: IProps) {
		super(scope, id, props);

		const { stage, api, table, userPool } = props;
	}
}
