import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getProjectRoot } from "@bronifty/fs-utils";
import * as fs from "node:fs";

console.log(fs.readdirSync(`${getProjectRoot()}/../../doc_build`));

export class CdkStaticHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, "bronifty-deleteme", {});

    // Create S3 origin without OAI
    const s3Origin = new cdk.aws_cloudfront_origins.S3Origin(bucket, {
      originAccessIdentity: undefined, // This disables OAI
    });

    // Create CloudFront OAC
    const oac = new cdk.aws_cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "OAC for S3 Static Website",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Create CloudFront distribution
    const distribution = new cdk.aws_cloudfront.Distribution(
      this,
      "Distribution",
      {
        defaultBehavior: {
          origin: s3Origin,
          viewerProtocolPolicy:
            cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
      }
    );

    // Attach OAC to the distribution
    const cfnDistribution = distribution.node
      .defaultChild as cdk.aws_cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride(
      "DistributionConfig.Origins.0.OriginAccessControlId",
      oac.getAtt("Id")
    );

    // Update bucket policy
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com"),
        ],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

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
        distribution,
        distributionPaths: ["/*"],
      }
    );

    // Export the Function URL as a stack output
    new cdk.CfnOutput(this, "bucketName", {
      value: bucket.bucketName,
      description: "name of the S3 bucket",
      exportName: "bucketName",
    });

    // Output CloudFront URL
    new cdk.CfnOutput(this, "DistributionUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "CloudFront Distribution URL",
    });
  }
}
