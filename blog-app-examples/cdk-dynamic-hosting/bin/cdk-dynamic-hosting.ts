#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamicHostingStack } from "../lib/cdk-dynamic-hosting-stack";
import { LambdaStack } from "../lib/lambda-stack";

// if your github actions workflow does not set these env vars or you don't have them preset somewhere in a file perhaps, then just hardcode them here.
process.env.AWS_ACCOUNT_ID = "851725517932";
process.env.AWS_REGION = "us-east-1";

// Function to get AWS account ID from environment variable
function getAccountId(): string {
  console.log(process.env.AWS_ACCOUNT_ID);
  return process.env.AWS_ACCOUNT_ID || "";
}

// Function to get AWS region from environment variable
function getRegion(): string {
  console.log(process.env.AWS_REGION);
  return process.env.AWS_REGION || "";
}

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, "LambdaStack", {
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
new DynamicHostingStack(app, "DynamicHostingStack", {
  functionUrl: lambdaStack.functionUrl,
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
