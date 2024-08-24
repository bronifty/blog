import { createRequestHandler } from "@remix-run/express";
import serverless from "serverless-http";
import express from "express";

async function createHandler(projectPath) {
  const app = express();

  // Dynamically import the build
  const build = await import(`${projectPath}/build/server/index.js`);

  // Handle all routes with the Remix request handler
  app.all("*", createRequestHandler({ build }));

  // Create a serverless handler
  return { app, handler: serverless(app) };
}

// Example usage:
// const { app, handler } = await createHandler('./project1');
// const { app: app2, handler: handler2 } = await createHandler('./project2');

export { createHandler };
