#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamicHostingStack } from "../lib/cdk-dynamic-hosting-stack";
import { execSync } from "node:child_process";

// Function to get AWS account ID
function getAccountId(): string {
  const accountId = execSync(
    "aws sts get-caller-identity --query Account --output text"
  )
    .toString()
    .trim();
  process.env.AWS_ACCOUNT_ID = accountId || "";
  return process.env.AWS_ACCOUNT_ID;
}

// Function to get AWS region
function getRegion(): string {
  const region = execSync("aws configure get region").toString().trim();
  process.env.AWS_REGION = region || "";
  return process.env.AWS_REGION;
}

const app = new cdk.App();
new DynamicHostingStack(app, "DynamicHostingStack", {
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
