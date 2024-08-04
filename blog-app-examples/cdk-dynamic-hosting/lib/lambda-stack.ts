import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { getProjectRoot } from "@bronifty/fs-utils";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";

let codePath = `${getProjectRoot()}/../remix-lambda/lambda.zip`;
console.log(codePath);

export class LambdaStack extends cdk.Stack {
  public readonly functionUrl: cdk.aws_lambda.FunctionUrl;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new cdk.aws_lambda.Function(this, "remix-lambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: "lambda.handler",
      code: cdk.aws_lambda.Code.fromAsset(codePath), // requires the remix-lambda project to be built and zipped first
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

    this.functionUrl = functionUrl;

    // Export the Function URL as a stack output
    new cdk.CfnOutput(this, "LambdaFunctionUrl", {
      value: functionUrl.url,
      description: "URL of the Lambda function",
      exportName: "RemixLambdaFunctionUrl",
    });
  }
}
