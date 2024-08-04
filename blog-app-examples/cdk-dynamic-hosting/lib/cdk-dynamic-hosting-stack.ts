import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getProjectRoot } from "@bronifty/fs-utils";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";
import { getDomainName } from "./utils";

const codePath = `${getProjectRoot()}/../remix-lambda/build/client`;
console.log(codePath);

interface DynamicHostingStackProps extends cdk.StackProps {
  functionUrl: cdk.aws_lambda.FunctionUrl;
  certificateArn: string;
}

export class DynamicHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DynamicHostingStackProps) {
    super(scope, id, props);

    const functionUrlDomainName = getDomainName(props.functionUrl.url);

    const domainName = "bronifty.xyz";
    const ssrSubdomain = `ssr.${domainName}`;

    // Create a new S3 bucket
    const bucket = new s3.Bucket(this, "SSRBucket", {
      bucketName: ssrSubdomain,
      // websiteIndexDocument: "index.html",
      // websiteErrorDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // const bucket = s3.Bucket.fromBucketArn(
    //   this,
    //   "ExistingBucket",
    //   "arn:aws:s3:::www.bronifty.xyz"
    // ); // note: using an existing bucket will require a manual step to update the bucket policy to allow cloudfront to access the bucket
    // TODO: refactor to use a new bucket with custom name

    // Look up the hosted zone
    const zone = cdk.aws_route53.HostedZone.fromLookup(this, "Zone", {
      domainName,
    });

    // Create Origin Access Control
    const oac = new cloudfront.CfnOriginAccessControl(this, "oac-for-assets", {
      originAccessControlConfig: {
        name: "OAC for /assets/*",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Create CloudFront distribution using CfnDistribution
    const distribution = new cloudfront.CfnDistribution(this, "Distribution", {
      distributionConfig: {
        enabled: true,
        // defaultRootObject: "index.html",
        defaultCacheBehavior: {
          targetOriginId: "LambdaOrigin", // Change this to target the Lambda origin
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
            "PUT",
            "PATCH",
            "POST",
            "DELETE",
          ], // Allow all methods
          cachedMethods: ["GET", "HEAD"],
          forwardedValues: {
            queryString: true, // Forward query strings to Lambda
            headers: [
              "Origin",
              "Access-Control-Request-Headers",
              "Access-Control-Request-Method",
            ], // Forward necessary headers
          },
        },
        origins: [
          {
            id: "S3Origin",
            domainName: bucket.bucketRegionalDomainName,
            originAccessControlId: oac.getAtt("Id").toString(),
            s3OriginConfig: {},
          },
          {
            id: "LambdaOrigin",
            domainName: functionUrlDomainName,
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: "https-only",
            },
          },
        ],
        cacheBehaviors: [
          {
            pathPattern: "/assets/*", // Adjust this pattern to match your static asset paths
            targetOriginId: "S3Origin",
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS"],
            cachedMethods: ["GET", "HEAD"],
            forwardedValues: {
              queryString: false,
            },
          },
        ],
        viewerCertificate: {
          acmCertificateArn: props.certificateArn,
          sslSupportMethod: "sni-only",
          minimumProtocolVersion: "TLSv1.2_2021",
        },
        aliases: [ssrSubdomain],
        customErrorResponses: [
          {
            errorCode: 403,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 300,
          },
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 300,
          },
        ],
      },
    });

    // Create an IDistribution interface from the CfnDistribution
    const distributionInterface =
      cloudfront.Distribution.fromDistributionAttributes(
        this,
        "ImportedDistributionInterface",
        {
          domainName: distribution.attrDomainName,
          distributionId: distribution.ref,
        }
      );

    // Create Route 53 record for the SSR subdomain
    new cdk.aws_route53.ARecord(this, "SSRAliasRecord", {
      zone,
      recordName: ssrSubdomain,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(distributionInterface)
      ),
    });
    // // Create Route 53 records
    // new cdk.aws_route53.ARecord(this, "AliasRecord", {
    //   zone,
    //   recordName: domainName,
    //   target: cdk.aws_route53.RecordTarget.fromAlias(
    //     new cdk.aws_route53_targets.CloudFrontTarget(distributionInterface)
    //   ),
    // });

    // new cdk.aws_route53.ARecord(this, "WWWAliasRecord", {
    //   zone,
    //   recordName: www,
    //   target: cdk.aws_route53.RecordTarget.fromAlias(
    //     new cdk.aws_route53_targets.CloudFrontTarget(distributionInterface)
    //   ),
    // });

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
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset(codePath)],
      destinationBucket: bucket,
      distribution: cloudfront.Distribution.fromDistributionAttributes(
        this,
        "ImportedDistribution",
        {
          domainName: distribution.attrDomainName,
          distributionId: distribution.ref,
        }
      ),
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "SSRSubdomainUrl", {
      value: `https://${ssrSubdomain}`,
      description: "SSR Subdomain URL",
    });
    new cdk.CfnOutput(this, "DistributionUrl", {
      value: `https://${distribution.attrDomainName}`,
      description: "CloudFront Distribution URL",
    });
    new cdk.CfnOutput(this, "BucketUrl", {
      value: `https://${bucket.bucketRegionalDomainName}`,
      description: "S3 Bucket URL",
    });
  }
}
