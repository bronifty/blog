import * as esbuild from "esbuild";
import path from "path";

async function buildService(entryPoint) {
  const parsedPath = path.parse(entryPoint);
  const outfile = path.join(parsedPath.dir, `${parsedPath.name}.cjs`);

  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: "node",
      target: "node20",
      format: "cjs",
      outfile: outfile,
      external: ["node:fs", "node:path", "node:crypto"],
    });
    console.log(`Build complete for ${entryPoint} -> ${outfile}`);
  } catch (error) {
    console.error(`Build failed for ${entryPoint}:`, error);
  }
}

// Example usage:
// await buildService("service1.mjs");

// If you want to build multiple services:
// await Promise.all([
//   buildService("service1.mjs"),
//   buildService("service2.mjs"),
//   // Add more services as needed
// ]);

// import * as esbuild from "esbuild";

// await esbuild.build({
//   entryPoints: ["service1.mjs"],
//   bundle: true,
//   platform: "node",
//   target: "node20",
//   format: "cjs", // Change format to CommonJS
//   outfile: "service1.cjs", // Change output file extension to .cjs
//   external: ["node:fs", "node:path", "node:crypto"],
// });

// console.log("Build complete");
