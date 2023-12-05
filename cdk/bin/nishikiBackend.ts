#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { NishikiBackendStack } from "../lib/nishikiBackend-stack";
import { NishikiStaticAssetsStack } from "../lib/nishikiStaticAssets-stack";
import {resourceName, stageName} from "../utils";

const stage = stageName();

const app = new cdk.App();
const staticAssets = new NishikiStaticAssetsStack(
	app,
	resourceName("NishikiStaticAssetsStack", stage),
	{ stage },
);
new NishikiBackendStack(app, resourceName("NishikiBackendStack", stage), {
	stage,
});
