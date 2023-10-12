import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NishiliBackendStack } from "../lib/nishikiBackend-stack";

describe("NishiliBackendStack", () => {
  test("sysnthesizes correctly", () => {
    const app = new cdk.App();

    // Create the NishiliBackendStack.
    const nishiliBackendStack = new NishiliBackendStack(
      app,
      "NishiliBackendStack"
    );

    // Prepare the stack for assertions.
    const template = Template.fromStack(nishiliBackendStack);

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
