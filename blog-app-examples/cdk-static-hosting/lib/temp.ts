import { getProjectRoot } from "@bronifty/fs-utils";
import * as fs from "node:fs";

console.log(fs.readdirSync(`${getProjectRoot()}/../../doc_build`));

// fs.rmSync(`${getProjectRoot()}/../doc_build`, { recursive: true, force: true });
