import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getProjectRoot } from "@bronifty/fs-utils";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";

console.log(`${getProjectRoot()}/../../doc_build`);

export class DynamicHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = "bronifty.xyz";
    const www = `www.${domainName}`;
    const bucket = s3.Bucket.fromBucketArn(
      this,
      "ExistingBucket",
      "arn:aws:s3:::bronifty.xyz"
    );

    // Look up the hosted zone
    const zone = cdk.aws_route53.HostedZone.fromLookup(this, "Zone", {
      domainName,
    });

    // Create a certificate
    const certificate = new cdk.aws_certificatemanager.Certificate(
      this,
      "Certificate",
      {
        domainName: domainName,
        subjectAlternativeNames: [www],
        validation:
          cdk.aws_certificatemanager.CertificateValidation.fromDns(zone),
      }
    );

    const lambda = new cdk.aws_lambda.Function(this, "remix-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: "lambda.handler",
      code: cdk.aws_lambda.Code.fromAsset(
        `${getProjectRoot()}/../remix-lambda/deploy.zip`
      ), // requires the remix-lambda project to be built and zipped first
    });

    // Create a Function URL for the Lambda
    const functionUrl = lambda.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [cdk.aws_lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    });

    // Create Origin Access Control
    const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "OAC for S3 Static Website",
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });

    // Create CloudFront distribution using CfnDistribution
    const distribution = new cloudfront.CfnDistribution(this, "Distribution", {
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
          acmCertificateArn: certificate.certificateArn,
          sslSupportMethod: "sni-only",
          minimumProtocolVersion: "TLSv1.2_2021",
        },
        aliases: [domainName, www],
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

    // Create Route 53 records
    new cdk.aws_route53.ARecord(this, "AliasRecord", {
      zone,
      recordName: domainName,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(distributionInterface)
      ),
    });

    new cdk.aws_route53.ARecord(this, "WWWAliasRecord", {
      zone,
      recordName: www,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(distributionInterface)
      ),
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
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset(`${getProjectRoot()}/../../doc_build`)],
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

    new cdk.CfnOutput(this, "CustomDomainUrl", {
      value: `https://${domainName}`,
      description: "Custom Domain URL",
    });
    new cdk.CfnOutput(this, "WWWCustomDomainUrl", {
      value: `https://${www}`,
      description: "WWW Custom Domain URL",
    });
    new cdk.CfnOutput(this, "DistributionUrl", {
      value: `https://${distribution.attrDomainName}`,
      description: "CloudFront Distribution URL",
    });
    new cdk.CfnOutput(this, "BucketUrl", {
      value: `https://${bucket.bucketRegionalDomainName}`,
      description: "S3 Bucket URL",
    });
    // Export the Function URL as a stack output
    new cdk.CfnOutput(this, "LambdaFunctionUrl", {
      value: functionUrl.url,
      description: "URL of the Lambda function",
      exportName: "RemixLambdaFunctionUrl",
    });
  }
}
