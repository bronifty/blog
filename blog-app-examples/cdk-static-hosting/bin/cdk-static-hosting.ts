#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStaticHostingStack } from "../lib/cdk-static-hosting-stack";
import { execSync } from "node:child_process";

// Function to get AWS account ID
function getAccountId(): string {
  return execSync("aws sts get-caller-identity --query Account --output text")
    .toString()
    .trim();
}

// Function to get AWS region
function getRegion(): string {
  return execSync("aws configure get region").toString().trim();
}

const app = new cdk.App();
new CdkStaticHostingStack(app, "CdkStaticHostingStack", {
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
