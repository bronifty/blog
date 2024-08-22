//local.js
import { handler, app } from "../lambda.cjs";
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
  const result = await handler(event);
  console.log(result.body);
}

main(apigRequest);
main(cloudfrontRequest);

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
