import { Fn, Stack } from "aws-cdk-lib";

function getSuffixFromStack(stack: Stack) {
  const shortStackId = Fn.select(2, Fn.split("/", stack.stackId));
  const suffix = Fn.select(4, Fn.split("-", shortStackId));
  return suffix;
}

function getDomainName(url: string) {
  const domainName = Fn.select(2, Fn.split("/", url));
  return domainName;
}

export { getDomainName, getSuffixFromStack };
//   const domainName = getDomainName(originalUrl);
