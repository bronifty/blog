#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStaticHostingStack } from "../lib/cdk-static-hosting-stack";
// import { execSync } from "node:child_process";

// // Function to get AWS account ID
// function getAccountId(): string {
//   return execSync("aws sts get-caller-identity --query Account --output text")
//     .toString()
//     .trim();
// }

// Function to get AWS region
// function getRegion(): string {
//   return execSync("aws configure get region").toString().trim();
// }

process.env.AWS_ACCOUNT_ID = "851725517932";
process.env.AWS_REGION = "us-east-1";

const app = new cdk.App();
new CdkStaticHostingStack(app, "CdkStaticHostingStack", {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
});
