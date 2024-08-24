import { getProjectRoot, readJson } from "@bronifty/fs-utils";

// events
const apigRequest = await readJson(`${getProjectRoot()}/events/apig.json`);
const cloudfrontRequest = await readJson(
  `${getProjectRoot()}/events/cloudfront.json`
);

export { apigRequest, cloudfrontRequest };
