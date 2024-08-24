import { apigRequest, cloudfrontRequest } from "../events/request.mjs";
import { app, handler } from "../service2.mjs";

const apigResult = await handler(apigRequest);
console.log(apigResult.body);

const cloudfrontResult = await handler(cloudfrontRequest);
console.log(cloudfrontResult.body);

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
