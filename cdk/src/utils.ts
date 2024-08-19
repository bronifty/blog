import * as cdk from "aws-cdk-lib";

function getSuffixFromStack(stack: cdk.Stack) {
  const shortStackId = cdk.Fn.select(2, cdk.Fn.split("/", stack.stackId));
  const suffix = cdk.Fn.select(4, cdk.Fn.split("-", shortStackId));
  return suffix;
}
function getDomainName(url: string) {
  const domainName = cdk.Fn.select(2, cdk.Fn.split("/", url));
  return domainName;
}

export { getDomainName, getSuffixFromStack };
