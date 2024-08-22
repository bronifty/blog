import { getProjectRoot } from "@bronifty/fs-utils";
import { createHandler } from "./createHandler.mjs";

const { app, handler } = await createHandler(
  `${getProjectRoot()}/../react-router-7-contacts`
);

export { app, handler };
