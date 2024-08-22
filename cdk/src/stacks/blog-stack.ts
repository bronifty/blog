import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../utils";
import { getProjectRoot } from "@bronifty/fs-utils";
import { PriceClass } from "@aws-sdk/client-cloudfront";

interface BlogStackProps extends cdk.StackProps {
  certificateArn: string;
}

export class BlogStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BlogStackProps) {
    super(scope, id, props);

    const apexDomain = "bronifty.org";
    const wwwDomain = "www.bronifty.org";

    const bucket = new cdk.aws_s3.Bucket(this, "BlogBucket", {
      bucketName: `blog-assets-${getSuffixFromStack(this)}`,
      publicReadAccess: false,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create Origin Access Control
    const oac = new cdk.aws_cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "oac-s3-2",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Create CloudFront distribution using CfnDistribution
    const distribution = new cdk.aws_cloudfront.CfnDistribution(
      this,
      "Distribution",
      {
        distributionConfig: {
          enabled: true,
          defaultRootObject: "index.html",
          defaultCacheBehavior: {
            targetOriginId: "S3Origin",
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS"],
            cachedMethods: ["GET", "HEAD"],
            forwardedValues: {
              queryString: false,
            },
          },
          origins: [
            {
              id: "S3Origin",
              domainName: bucket.bucketRegionalDomainName,
              originAccessControlId: oac.getAtt("Id").toString(),
              s3OriginConfig: {},
            },
          ],
          viewerCertificate: {
            acmCertificateArn: props.certificateArn,
            sslSupportMethod: "sni-only",
            minimumProtocolVersion: "TLSv1.2_2021",
          },
          aliases: [apexDomain, wwwDomain],
          priceClass: cdk.aws_cloudfront.PriceClass.PRICE_CLASS_100,
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
      }
    );

    // Deploy website content
    new cdk.aws_s3_deployment.BucketDeployment(this, "DeployWebsite", {
      sources: [
        cdk.aws_s3_deployment.Source.asset(`${getProjectRoot()}/../doc_build`),
      ],
      destinationBucket: bucket,
      distribution: cdk.aws_cloudfront.Distribution.fromDistributionAttributes(
        this,
        "ImportedDistribution",
        {
          domainName: distribution.attrDomainName,
          distributionId: distribution.ref,
        }
      ),
      distributionPaths: ["/*"],
    });

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
            "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.ref}`,
          },
        },
      })
    );

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
