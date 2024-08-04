#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStaticHostingStack } from "../lib/cdk-static-hosting-stack";

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
new CdkStaticHostingStack(app, "CdkStaticHostingStack", {
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
