import { createRequestHandler } from "@remix-run/express";
import serverless from "serverless-http";
import express from "express";
import * as build from "./build/server/index.js";

const app = express();

// Serve static files from the client build directory
// app.use(express.static("build/client"));

// Handle all routes with the Remix request handler
app.all("*", createRequestHandler({ build }));

// export { app as handler };

// // Create a serverless handler
const serverlessHandler = serverless(app);

// Export the handler function for Lambda
const handler = async (event, context) => {
  // Cloudfront sends requests with lowercase headers
  // This normalizes the headers to work with Express
  const normalizedEvent = {
    ...event,
    headers: Object.fromEntries(
      Object.entries(event.headers).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ])
    ),
  };

  const result = await serverlessHandler(normalizedEvent, context);

  // Ensure the response has the correct content-type for HTML
  if (!result.headers["content-type"]) {
    result.headers["content-type"] = "text/html; charset=utf-8";
  }

  return result;
};

export { app, handler, serverlessHandler };
