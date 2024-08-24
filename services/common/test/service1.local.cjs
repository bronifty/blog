// const { apigRequest, cloudfrontRequest } = require("../events/request.mjs");
const { app, handler } = require("../service1.cjs");

// const apigResult = await handler(apigRequest);
// console.log(apigResult.body);

// const cloudfrontResult = await handler(cloudfrontRequest);
// console.log(cloudfrontResult.body);

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
