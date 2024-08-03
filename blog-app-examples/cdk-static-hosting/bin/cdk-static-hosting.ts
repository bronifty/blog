#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStaticHostingStack } from "../lib/cdk-static-hosting-stack";
import { CdkStaticHostingStack as CdkStaticHostingStack2 } from "../lib/cdk-static-hosting-stack2";
import { CdkStaticHostingStack as CdkStaticHostingStack3 } from "../lib/cdk-static-hosting-stack3";

const app = new cdk.App();
new CdkStaticHostingStack(app, "CdkStaticHostingStack", {});
new CdkStaticHostingStack2(app, "CdkStaticHostingStack2", {});
new CdkStaticHostingStack3(app, "CdkStaticHostingStack3", {});
