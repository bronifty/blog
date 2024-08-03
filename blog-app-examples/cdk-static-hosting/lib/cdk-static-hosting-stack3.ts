import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getProjectRoot } from "@bronifty/fs-utils";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";

export class CdkStaticHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, "StaticWebsiteBucket2", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Create Origin Access Control
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC2", {
      originAccessControlConfig: {
        name: "OAC2 for S3 Static Website",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Create CloudFront distribution using CfnDistribution
    const distribution = new cloudfront.CfnDistribution(this, "Distribution2", {
      distributionConfig: {
        enabled: true,
        defaultRootObject: "index.html",
        defaultCacheBehavior: {
          targetOriginId: "S3Origin2",
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD"],
          forwardedValues: {
            queryString: false,
          },
        },
        origins: [
          {
            id: "S3Origin2",
            domainName: bucket.bucketRegionalDomainName,
            originAccessControlId: oac.getAtt("Id").toString(),
            s3OriginConfig: {},
          },
        ],
      },
    });

    // Update bucket policy
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.ref}`,
          },
        },
      })
    );

    // Deploy website content
    new s3deploy.BucketDeployment(this, "DeployWebsite2", {
      sources: [s3deploy.Source.asset(`${getProjectRoot()}/../../doc_build`)],
      destinationBucket: bucket,
      distribution: cloudfront.Distribution.fromDistributionAttributes(
        this,
        "ImportedDistribution2",
        {
          domainName: distribution.attrDomainName,
          distributionId: distribution.ref,
        }
      ),
      distributionPaths: ["/*"],
    });

    // Output CloudFront URL
    new cdk.CfnOutput(this, "DistributionUrl2", {
      value: `https://${distribution.attrDomainName}`,
      description: "CloudFront Distribution URL",
    });
  }
}
