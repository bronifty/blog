import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["lambda.js"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs", // Change format to CommonJS
  outfile: "lambda.cjs", // Change output file extension to .cjs
  external: ["node:fs", "node:path", "node:crypto"],
});

console.log("Build complete");

// import * as esbuild from "esbuild";

// await esbuild.build({
//   entryPoints: ["lambda.js"],
//   bundle: true,
//   platform: "node",
//   target: "node20",
//   format: "esm",
//   outfile: "lambda.mjs",
//   external: ["node:fs", "node:path", "node:crypto"], // Added node:crypto
// });

// console.log("Build complete");
