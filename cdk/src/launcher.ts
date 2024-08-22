import { App } from "aws-cdk-lib";
import { BlogStack } from "./stacks/blog-stack";
import { RemixStack } from "./stacks/remix-stack";
import { ReactRouter7ContactsStack } from "./stacks/react-router-7-contacts-stack";

process.env.CERTIFICATE_ARN =
  "arn:aws:acm:us-east-1:533266994320:certificate/762bf6fe-5e4d-44bd-a67a-bc7bda41028a";
process.env.AWS_ACCOUNT_ID = "533266994320";
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

new ReactRouter7ContactsStack(app, "ReactRouter7ContactsStack", {
  certificateArn: getCertificateArn(),
  env: {
    account: getAccountId(),
    region: getRegion(),
  },
});
