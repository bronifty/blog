#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStaticHostingStack } from "../lib/cdk-static-hosting-stack";

const app = new cdk.App();
new CdkStaticHostingStack(app, "CdkStaticHostingStack", {
  env: {
    account: "851725517932",
    region: "us-east-1",
  },
});
