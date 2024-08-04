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

    const domainName = "bronifty.xyz";
    const www = `www.${domainName}`;

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

    // Create S3 bucket
    const bucket = new s3.Bucket(this, "StaticWebsiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
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

    // Output CloudFront URL
    new cdk.CfnOutput(this, "DistributionUrl", {
      value: `https://${distribution.attrDomainName}`,
      description: "CloudFront Distribution URL",
    });
    new cdk.CfnOutput(this, "CustomDomainUrl", {
      value: `https://${domainName}`,
      description: "Custom Domain URL",
    });
    new cdk.CfnOutput(this, "WWWCustomDomainUrl", {
      value: `https://${www}`,
      description: "WWW Custom Domain URL",
    });
  }
}

// import * as cdk from "aws-cdk-lib";
// import { Construct } from "constructs";
// import { getProjectRoot } from "@bronifty/fs-utils";
// import * as s3 from "aws-cdk-lib/aws-s3";
// import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
// import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
// import * as iam from "aws-cdk-lib/aws-iam";

// export class CdkStaticHostingStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // Create S3 bucket
//     const bucket = new s3.Bucket(this, "StaticWebsiteBucket", {
//       blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
//     });

//     // Create Origin Access Control
//     const oac = new cloudfront.CfnOriginAccessControl(this, "OAC", {
//       originAccessControlConfig: {
//         name: "OAC for S3 Static Website",
//         originAccessControlOriginType: "s3",
//         signingBehavior: "always",
//         signingProtocol: "sigv4",
//       },
//     });

//     // Create CloudFront distribution using CfnDistribution
//     const distribution = new cloudfront.CfnDistribution(this, "Distribution", {
//       distributionConfig: {
//         enabled: true,
//         defaultRootObject: "index.html",
//         defaultCacheBehavior: {
//           targetOriginId: "S3Origin",
//           viewerProtocolPolicy: "redirect-to-https",
//           allowedMethods: ["GET", "HEAD", "OPTIONS"],
//           cachedMethods: ["GET", "HEAD"],
//           forwardedValues: {
//             queryString: false,
//           },
//         },
//         origins: [
//           {
//             id: "S3Origin",
//             domainName: bucket.bucketRegionalDomainName,
//             originAccessControlId: oac.getAtt("Id").toString(),
//             s3OriginConfig: {},
//           },
//         ],
//       },
//     });

//     // Update bucket policy
//     bucket.addToResourcePolicy(
//       new iam.PolicyStatement({
//         actions: ["s3:GetObject"],
//         resources: [bucket.arnForObjects("*")],
//         principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
//         conditions: {
//           StringEquals: {
//             "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.ref}`,
//           },
//         },
//       })
//     );

//     // Deploy website content
//     new s3deploy.BucketDeployment(this, "DeployWebsite", {
//       sources: [s3deploy.Source.asset(`${getProjectRoot()}/../../doc_build`)],
//       destinationBucket: bucket,
//       distribution: cloudfront.Distribution.fromDistributionAttributes(
//         this,
//         "ImportedDistribution",
//         {
//           domainName: distribution.attrDomainName,
//           distributionId: distribution.ref,
//         }
//       ),
//       distributionPaths: ["/*"],
//     });

//     // Output CloudFront URL
//     new cdk.CfnOutput(this, "DistributionUrl", {
//       value: `https://${distribution.attrDomainName}`,
//       description: "CloudFront Distribution URL",
//     });
//   }
// }
