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
} from "aws-cdk-lib/aws-cognito";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

/**
 * If the stage is not prod, add "-dev" to the every asset's name.
 */
interface IProps extends StackProps {
	readonly stage: Stage;
}

export class NishikiStaticAssetsStack extends Stack {
	public readonly table: Table;
	public readonly userPool: UserPool;
	public readonly restApi: RestApi;

	constructor(scope: Construct, id: string, props: IProps) {
		super(scope, id, props);

		const { stage } = props;

		const userPool = nishikiUserPool(this, stage);

		const restApi = nishikiAPIGateway(this, stage, { userPool });

		this.userPool = userPool;
		this.restApi = restApi;

		this.table = nishikiTable(this, stage);
	}
}

/**
 * Create user pool and user pool client.
 * Add a Google provider.
 * @param scope
 * @param stage
 * @returns {UserPool, UserPoolClient}
 */
const nishikiUserPool = (scope: Construct, stage: Stage): UserPool => {
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
		attributeMapping: {
			email: ProviderAttribute.GOOGLE_EMAIL,
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
				`https://${ssmParameters.cognitoDomainPrefix}.auth.us-east-2.amazoncognito.com`,
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

const nishikiAPIGateway = (
	scope: Construct,
	stage: Stage,
	props: INishikiAPIGatewayProps,
): RestApi => {
	const { userPool } = props;

	// Configure options for API Gateway
	const apiOptions = {
		defaultCorsPreflightOptions: {
			allowOrigins: apigateway.Cors.ALL_ORIGINS,
			allowMethods: apigateway.Cors.ALL_METHODS,
		},
		loggingLevel: apigateway.MethodLoggingLevel.INFO,
		dataTraceEnabled: true,
		// domainName: {
		//   domainName: props.domainName,
		//   certificate: apiCert,
		// },
	};

	const api = new apigateway.RestApi(scope, "NishikiRestApi", apiOptions);
	const auth = new apigateway.CognitoUserPoolsAuthorizer(
		scope,
		"CognitoAuthorizer",
		{
			cognitoUserPools: [userPool],
		},
	);

	const example = api.root.addResource("example");

	example.addMethod(
		"GET",
		new apigateway.MockIntegration({
			integrationResponses: [{ statusCode: "200" }],
			passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
			requestTemplates: {
				"application/json": '{ "statusCode": 200 }',
			},
		}),
		{
			methodResponses: [{ statusCode: "200" }],
			authorizer: auth,
			authorizationType: apigateway.AuthorizationType.COGNITO,
		},
	);

	api.addGatewayResponse("ExpiredTokenResponse", {
		responseHeaders: {
			"Access-Control-Allow-Headers":
				"'Authorization,Content-Type,X-Amz-Date,X-Amz-Security-Token,X-Api-Key'",
			"Access-Control-Allow-Origin": "'*'",
		},
		statusCode: "401",
		type: apigateway.ResponseType.EXPIRED_TOKEN,
	});

	return api;
};

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
		indexName: "JoinLink",
		partitionKey: {
			name: "GroupId",
			type: AttributeType.STRING,
		},
		sortKey: {
			name: "LinkExpiredDatetime",
			type: AttributeType.STRING,
		},
		projectionType: ProjectionType.KEYS_ONLY,
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
