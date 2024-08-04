import { Fn } from "aws-cdk-lib";

// export function getSuffixFromStack(stack: Stack) {
//   const shortStackId = Fn.select(2, Fn.split("/", stack.stackId));
//   const suffix = Fn.select(4, Fn.split("-", shortStackId));
//   return suffix;
// }
const originalUrl =
  "https://w3l4df257grdcofaovb4wfkexy0lgwxd.lambda-url.us-east-1.on.aws/";

function getDomainName(url: string) {
  const domainName = Fn.select(2, Fn.split("/", url));
  return domainName;
}

const domainName = getDomainName(originalUrl);

console.log("domainName: ", domainName);
// const strippedUrl = originalUrl.replace(/^https?:\/\/|\/$/g, "");

// function stripUrl(url: string): string {
//   return url.replace(/^https?:\/\/|\/$/g, "");
// }
// console.log("stripUrl(originalUrl): ", stripUrl(originalUrl));

// import { getProjectRoot } from "@bronifty/fs-utils";
// import * as fs from "node:fs";
// import { execSync } from "node:child_process";

// // Function to get AWS account ID
// function getAccountId(): string {
//   const accountId = execSync(
//     "aws sts get-caller-identity --query Account --output text"
//   )
//     .toString()
//     .trim();
//   process.env.AWS_ACCOUNT_ID = accountId || "";
//   return process.env.AWS_ACCOUNT_ID;
// }

// // Function to get AWS region
// function getRegion(): string {
//   const region = execSync("aws configure get region").toString().trim();
//   process.env.AWS_REGION = region || "";
//   return process.env.AWS_REGION;
// }

// console.log(fs.readdirSync(`${getProjectRoot()}/../../doc_build`));

// console.log(getAccountId());
// console.log(getRegion());
// fs.rmSync(`${getProjectRoot()}/../doc_build`, { recursive: true, force: true });
