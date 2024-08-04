import { getProjectRoot } from "@bronifty/fs-utils";
import * as fs from "node:fs";
import { execSync } from "node:child_process";

// Function to get AWS account ID
function getAccountId(): string {
  const accountId = execSync(
    "aws sts get-caller-identity --query Account --output text"
  )
    .toString()
    .trim();
  process.env.AWS_ACCOUNT_ID = accountId || "";
  return process.env.AWS_ACCOUNT_ID;
}

// Function to get AWS region
function getRegion(): string {
  const region = execSync("aws configure get region").toString().trim();
  process.env.AWS_REGION = region || "";
  return process.env.AWS_REGION;
}

console.log(fs.readdirSync(`${getProjectRoot()}/../../doc_build`));

console.log(getAccountId());
console.log(getRegion());
// fs.rmSync(`${getProjectRoot()}/../doc_build`, { recursive: true, force: true });
