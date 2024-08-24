import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as FsUtils from "@bronifty/fs-utils";
import { getDomainName, getSuffixFromStack } from "../utils";

interface ReactRouter7ContactsStackProps extends cdk.StackProps {
  certificateArn: string;
}

export class ReactRouter7ContactsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ReactRouter7ContactsStackProps
  ) {
    super(scope, id, props);

    const reactRouterDomain = "react-router-7-contacts.bronifty.org";
    const projectRoot = `${FsUtils.getProjectRoot()}/../services/react-router-7-contacts`;

    const lambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "remix-lambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
        handler: "handler",
        entry: `${projectRoot}/lambda.ts`,
      }
    );

    // const lambda = new cdk.aws_lambda.Function(this, "remix-lambda", {
    //   runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    //   handler: "lambda.handler",
    //   code: cdk.aws_lambda.Code.fromAsset(
    //     `${getProjectRoot()}/../services/react-router-7-contacts/lambda.zip`
    //   ), // requires the remix-lambda project to be built and zipped first
    // });

    // Create a Function URL for the Lambda
    const functionUrl = lambda.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [cdk.aws_lambda.HttpMethod.ALL],
        allowedHeaders: ["*"],
      },
    });

    // this.functionUrl = functionUrl;

    const bucket = new cdk.aws_s3.Bucket(
      this,
      "react-router-7-contacts-bucket",
      {
        bucketName: `react-router-7-contacts-bucket-${getSuffixFromStack(
          this
        )}`,
        publicReadAccess: false,
        blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }
    );

    // Create Origin Access Control
    const oac = new cdk.aws_cloudfront.CfnOriginAccessControl(this, "OAC", {
      originAccessControlConfig: {
        name: "oac-s3-react-router-7-contacts",
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
          // defaultRootObject: "index.html",
          defaultCacheBehavior: {
            targetOriginId: "LambdaOrigin",
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
              domainName: getDomainName(functionUrl.url),
              customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                originProtocolPolicy: "https-only",
              },
            },
          ],
          cacheBehaviors: [
            {
              pathPattern: "/assets/*",
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
          aliases: [reactRouterDomain],
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
        cdk.aws_s3_deployment.Source.asset(`${projectRoot}/build/client`),
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
    // Export the Function URL as a stack output
    new cdk.CfnOutput(this, "react-router-7-contacts-lambda-url", {
      value: functionUrl.url,
    });
    new cdk.CfnOutput(this, "react-router-7-contacts-distribution-url", {
      value: `https://${distribution.attrDomainName}`,
    });
    new cdk.CfnOutput(this, "react-router-7-contacts-bucket-url", {
      value: `https://${bucket.bucketRegionalDomainName}`,
    });
  }
}
