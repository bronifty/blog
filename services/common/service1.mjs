import { getProjectRoot } from "@bronifty/fs-utils";
import { createHandler } from "./createHandler.mjs";

let app, handler;

(async () => {
  ({ app, handler } = await createHandler(`${getProjectRoot()}/../vite-remix`));
})();

export { app, handler };
