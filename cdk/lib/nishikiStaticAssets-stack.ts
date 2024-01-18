import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
	AttributeType,
	BillingMode,
	ProjectionType,
	Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Stage } from "../utils";
import {
	AccountRecovery,
	OAuthScope,
	ProviderAttribute,
	UserPool,
	UserPoolClient,
	UserPoolIdentityProviderGoogle,
	UserPoolOperation,
} from "aws-cdk-lib/aws-cognito";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";

/**
 * If the stage is not prod, add "-dev" to the every asset's name.
 */
interface IProps extends StackProps {
	readonly stage: Stage;
}

export class NishikiStaticAssetsStack extends Stack {
	public readonly table: Table;
	public readonly userPool: UserPool;

	constructor(scope: Construct, id: string, props: IProps) {
		super(scope, id, props);

		const { stage } = props;

		this.table = nishikiTable(this, stage);

		this.userPool = nishikiUserPool(this, stage);

		// create a function from other stack
		const cognitoTriggerFunctionArn = cdk.Fn.importValue(
			`nishiki-cognito-trigger-function-${stage}`,
		);
		const cognitoTriggerFunction = lambda.Function.fromFunctionArn(
			this,
			"cognitoTriggerFunction",
			cognitoTriggerFunctionArn,
		);

		// add trigger to user pool
		this.userPool.addTrigger(
			UserPoolOperation.PRE_SIGN_UP,
			cognitoTriggerFunction,
		);
	}
}

const nishikiUserInitialize = (scope: Stack, stage: Stage): lambda.Function => {
	return new lambdaNode.NodejsFunction(scope, "userInitializeInitFunction", {
		functionName: `nishiki-user-initialize-function-${stage}-function`,
		entry: path.join(__dirname, "../../backend/main/src/handler.ts"),
		handler: "handler",
		projectRoot: path.join(__dirname, "../../backend/main"),
		depsLockFilePath: path.join(
			__dirname,
			"../../backend/main/package-lock.json",
		),
		runtime: lambda.Runtime.NODEJS_18_X,
		environment: {
			TABLE_NAME: `nishiki-table-${stage}-db`,
			REGION: scope.region,
		},
	});
};

/**
 * Create user pool and user pool client.
 * Add a Google provider.
 * @param scope
 * @param stage
 * @param lambda - the lambda function to be triggered after authentication.
 * @returns {UserPool, UserPoolClient}
 */
const nishikiUserPool = (scope: Stack, stage: Stage): UserPool => {
	const userPool = new UserPool(scope, "NishikiUserPool", {
		userPoolName: `nishiki-users-${stage}-user-pool`,
		selfSignUpEnabled: false,
		signInAliases: {
			email: true,
			username: false,
		},
		standardAttributes: {
			email: {
				required: true,
			},
		},
		passwordPolicy: {
			minLength: 8,
			requireLowercase: true,
			requireUppercase: true,
			requireDigits: true,
		},
		accountRecovery: AccountRecovery.EMAIL_ONLY,
		removalPolicy: RemovalPolicy.DESTROY,
	});

	const ssmParameters = CognitoSsmParameters(scope, stage);

	userPool.addDomain("NishikiCognitoDomain", {
		cognitoDomain: {
			domainPrefix: ssmParameters.cognitoDomainPrefix,
		},
	});

	// create google identity provider
	new UserPoolIdentityProviderGoogle(scope, "NishikiGoogleProvider", {
		clientId: ssmParameters.googleClientId,
		// TODO googleClientSecret variable should be replaced with secret value from secret manager, then avoid using unsafePlainText
		// clientSecret: googleClientSecret,
		clientSecretValue: SecretValue.unsafePlainText(
			ssmParameters.googleClientSecret,
		),
		userPool: userPool,
		scopes: ["email", "openid", "profile"],
		// Map fields from the user's Google profile to Cognito user fields
		// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito.AttributeMapping.html
		attributeMapping: {
			email: ProviderAttribute.GOOGLE_EMAIL,
			nickname: ProviderAttribute.GOOGLE_NAME,
		},
	});

	const userPoolClient = new UserPoolClient(scope, "NishikiUserPoolClient", {
		userPool: userPool,
		authFlows: {
			adminUserPassword: true,
			userPassword: true,
			userSrp: true,
		},
		generateSecret: false,
		oAuth: {
			flows: {
				authorizationCodeGrant: true,
			},
			scopes: [
				OAuthScope.EMAIL,
				OAuthScope.OPENID,
				OAuthScope.PROFILE,
				OAuthScope.COGNITO_ADMIN,
			],
			callbackUrls: [
				`https://${ssmParameters.cognitoDomainPrefix}.auth.${scope.region}.amazoncognito.com`,
				"http://localhost:3000",
			],
		},
	});

	// create outputs for frontend
	new cdk.CfnOutput(scope, "NishikiUserPoolId", {
		value: userPool.userPoolId,
	});

	new cdk.CfnOutput(scope, "NishikiUserPoolClientId", {
		value: userPoolClient.userPoolClientId,
	});

	return userPool;
};

interface ISsmParameters {
	cognitoDomainPrefix: string;
	googleClientId: string;
	googleClientSecret: string;
}

/**
 * This function fetches SSM parameters that is hosted on the AWS account.
 * @param scope
 * @param stage
 * @return ISsmParameters
 */
const CognitoSsmParameters = (
	scope: Construct,
	stage: Stage,
): ISsmParameters => {
	const cognitoDomainPrefix = ssm.StringParameter.valueForStringParameter(
		scope,
		`/nishiki/${stage}/cognito-domain-prefix`,
	);

	// https://developers.google.com/identity/sign-in/web/sign-in
	const googleClientId = ssm.StringParameter.valueForStringParameter(
		scope,
		`/nishiki/${stage}/google-client-id`,
	);

	const googleClientSecret = ssm.StringParameter.valueForStringParameter(
		scope,
		`/nishiki/${stage}/google-client-secret`,
	);

	return {
		cognitoDomainPrefix,
		googleClientId,
		googleClientSecret,
	};
};

interface INishikiAPIGatewayProps {
	userPool: UserPool;
}

/**
 * This function creates a DynamoDB named 'nishiki-table-prod-db'.
 * [The table definition is witten here](https://genesis-tech-tribe.github.io/nishiki-documents/project-document/database)
 * @param scope
 * @param stage
 */
const nishikiTable = (scope: Construct, stage: Stage): Table => {
	const nishikiTable = new Table(scope, "NishikiTable", {
		tableName: `nishiki-table-${stage}-db`,
		billingMode: BillingMode.PAY_PER_REQUEST,
		partitionKey: {
			name: "PK",
			type: AttributeType.STRING,
		},
		sortKey: {
			name: "SK",
			type: AttributeType.STRING,
		},
		removalPolicy:
			stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
	});

	nishikiTable.addGlobalSecondaryIndex({
		indexName: "UserAndGroupRelationship",
		partitionKey: {
			name: "GroupId",
			type: AttributeType.STRING,
		},
		projectionType: ProjectionType.KEYS_ONLY,
	});

	nishikiTable.addGlobalSecondaryIndex({
		indexName: "GroupAndContainerRelationship",
		partitionKey: {
			name: "ContainerId",
			type: AttributeType.STRING,
		},
		projectionType: ProjectionType.KEYS_ONLY,
	});

	nishikiTable.addGlobalSecondaryIndex({
		indexName: "InvitationHash",
		partitionKey: {
			name: "InvitationLinkHash",
			type: AttributeType.STRING,
		},
		projectionType: ProjectionType.INCLUDE,
		nonKeyAttributes: ["LinkExpiryDatetime"],
	});

	nishikiTable.addGlobalSecondaryIndex({
		indexName: "EMailAndUserIdRelationship",
		partitionKey: {
			name: "EMailAddress",
			type: AttributeType.STRING,
		},
		projectionType: ProjectionType.KEYS_ONLY,
	});

	return nishikiTable;
};
