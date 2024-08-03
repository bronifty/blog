import { createRequestHandler } from "@remix-run/express";
import serverless from "serverless-http";
import express from "express";
import * as build from "./build/server/index.js";

const app = express();

// Serve static files from the client build directory
// app.use(express.static("build/client"));

// Handle all routes with the Remix request handler
app.all("*", createRequestHandler({ build }));

// // Create a serverless handler
const handler = serverless(app);

export { app, handler };
