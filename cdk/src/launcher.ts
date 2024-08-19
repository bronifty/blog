import { App } from "aws-cdk-lib";
import { BlogStack } from "./stacks/blog-stack";
import { RemixStack } from "./stacks/remix-stack";

process.env.CERTIFICATE_ARN =
  "arn:aws:acm:us-east-1:851725517932:certificate/f5164cd1-7532-42ba-b194-ad681a98c7f4";
process.env.AWS_ACCOUNT_ID = "851725517932";
process.env.AWS_REGION = "us-east-1";

function getCertificateArn(): string {
  console.log(process.env.CERTIFICATE_ARN);
  return process.env.CERTIFICATE_ARN || "";
}

// Function to get AWS account ID from environment variable
function getAccountId(): string {
  console.log(process.env.AWS_ACCOUNT_ID);
  return process.env.AWS_ACCOUNT_ID || "";
}

// Function to get AWS region from environment variable
function getRegion(): string {
  console.log(process.env.AWS_REGION);
  return process.env.AWS_REGION || "";
}

const app = new App();

new BlogStack(app, "BlogStack", {
  certificateArn: getCertificateArn(),
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});

new RemixStack(app, "RemixStack", {
  certificateArn: getCertificateArn(),
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
