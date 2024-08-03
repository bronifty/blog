import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getProjectRoot } from "@bronifty/fs-utils";
import * as fs from "node:fs";

console.log(fs.readdirSync(`${getProjectRoot()}/../../doc_build`));

export class CdkStaticHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, "bronifty-deleteme", {});

    const deployment = new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "DeployWithCDK",
      {
        sources: [
          cdk.aws_s3_deployment.Source.asset(
            `${getProjectRoot()}/../../doc_build`
          ),
        ],
        destinationBucket: bucket,
      }
    );
  }
}
