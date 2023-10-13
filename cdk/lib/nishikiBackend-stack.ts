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

export class NishiliBackendStack extends cdk.Stack {
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

    const congnitoDomainPrefix = ssm.StringParameter.valueForStringParameter(
      this,
      "/nishiki/prod/cognito-domain-prefix"
    );
    userPool.addDomain("NishikiCognitoDomain", {
      cognitoDomain: {
        domainPrefix: congnitoDomainPrefix,
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
          `https://${congnitoDomainPrefix}.auth.us-east-2.amazoncognito.com`,
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
  }
}
