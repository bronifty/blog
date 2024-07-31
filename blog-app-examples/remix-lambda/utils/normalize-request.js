function normalizeRequest(event) {
  let headers = {};
  let method = "";
  let uri = "";
  let clientIp = "";

  if (event.Records) {
    // CloudFront request
    const cfRequest = event.Records[0].cf.request;
    headers = cfRequest.headers;
    method = cfRequest.method;
    uri = cfRequest.uri;
    clientIp = cfRequest.clientIp;
  } else {
    // API Gateway request
    headers = event.headers;
    method = event.httpMethod;
    uri = event.path;
    clientIp = event.requestContext.identity.sourceIp;
  }

  // Normalize headers to a single object
  const normalizedHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalizedHeaders[key.toLowerCase()] = value[0].value || value[0];
    } else {
      normalizedHeaders[key.toLowerCase()] = value;
    }
  }

  return {
    headers: normalizedHeaders,
    method,
    uri,
    clientIp,
  };
}

export { normalizeRequest };

// Example usage in handler
function handler(event) {
  const normalizedRequest = normalizeRequest(event);

  // Now you can use normalizedRequest.headers, normalizedRequest.method, etc.
  console.log(normalizedRequest);

  // ... existing code ...
}

// ... existing code ...
