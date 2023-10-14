import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NishikiBackendStack } from "../lib/nishikiBackend-stack";

describe("NishikiBackendStack", () => {
  test("sysnthesizes correctly", () => {
    const app = new cdk.App();

    // Create the NishikiBackendStack.
    const nishikiBackendStack = new NishikiBackendStack(
      app,
      "NishikiBackendStack"
    );

    // Prepare the stack for assertions.
    const template = Template.fromStack(nishikiBackendStack);

    // Assert it creates the user pool with the correct Schema properties
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      Schema: [{ Mutable: true, Name: "email", Required: true }],
    });

    // Assert it creates the user pool client with the correct SupportedIdentityProviders properties
    template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
      SupportedIdentityProviders: ["COGNITO", "Google"],
    });
  });
});
