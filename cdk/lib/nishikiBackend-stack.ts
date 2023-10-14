import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as Dynamo from "aws-cdk-lib/aws-dynamodb";
import {
  AccountRecovery,
  OAuthScope,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
} from "aws-cdk-lib/aws-cognito";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class NishikiBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "NishikiUserPool", {
      selfSignUpEnabled: true,
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cognitoDomainPrefix = ssm.StringParameter.valueForStringParameter(
      this,
      "/nishiki/prod/cognito-domain-prefix"
    );
    userPool.addDomain("NishikiCognitoDomain", {
      cognitoDomain: {
        domainPrefix: cognitoDomainPrefix,
      },
    });

    // https://developers.google.com/identity/sign-in/web/sign-in
    const googleClientId = ssm.StringParameter.valueForStringParameter(
      this,
      "/nishiki/prod/google-client-id"
    );
    const googleClientSecret = ssm.StringParameter.valueForStringParameter(
      this,
      "/nishiki/prod/google-client-secret"
    );

    // create google identity provider
    new UserPoolIdentityProviderGoogle(this, "Google", {
      clientId: googleClientId,
      // TODO googleClientSecret variable should be replaced with secret value from secret manager, then avoid using unsafePlainText
      // clientSecret: googleClientSecret,
      clientSecretValue: cdk.SecretValue.unsafePlainText(googleClientSecret),
      userPool: userPool,
      scopes: ["email"],
      // Map fields from the user's Google profile to Cognito user fields
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
      },
    });

    // create user pool client
    const userPoolClient = new UserPoolClient(this, "NishikiUserPoolClient", {
      userPool: userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
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
          `https://${cognitoDomainPrefix}.auth.us-east-2.amazoncognito.com`,
          "http://localhost:3000",
        ],
      },
    });

    // create outputs for frontend
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId || "",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId || "",
    });

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

    const api = new apigateway.RestApi(this, "nishiki-rest-api", apiOptions);
    const auth = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "CognitoAuthorizer",
      {
        cognitoUserPools: [userPool],
      }
    );
    /**
     * Example API
     * @example
     * ```ts
     * const example = api.root.addResource("example");
     * example.addMethod(
     *   "GET",
     *   new apigateway.MockIntegration({
     *     integrationResponses: [{ statusCode: "200" }],
     *     passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
     *     requestTemplates: {
     *       "application/json": '{ "statusCode": 200 }',
     *     },
     *   }),
     *   {
     *     methodResponses: [{ statusCode: "200" }],
     *     authorizer: auth,
     *     authorizationType: apigateway.AuthorizationType.COGNITO,
     *   }
     * );
     *
     * api.addGatewayResponse("ExpiredTokenResponse", {
     *   responseHeaders: {
     *     "Access-Control-Allow-Headers":
     *       "'Authorization,Content-Type,X-Amz-Date,X-Amz-Security-Token,X-Api-Key'",
     *     "Access-Control-Allow-Origin": "'*'",
     *   },
     *   statusCode: "401",
     *   type: apigateway.ResponseType.EXPIRED_TOKEN,
     * });
     * ```
     */
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
      }
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
  }
}
