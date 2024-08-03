import { serverlessHandler } from "../lambda.js";
import fs from "fs/promises";
import path from "path";

async function readJsonFile(filename) {
  const filePath = path.join(process.cwd(), "events", filename);
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

const apigRequest = await readJsonFile("apig.json");
const cloudfrontRequest = await readJsonFile("cloudfront.json");

async function main(event) {
  const result = await serverlessHandler(event);
  console.log(result.body);
}

main(apigRequest);
main(cloudfrontRequest);

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
