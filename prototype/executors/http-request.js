/**
 * HTTP Request Executor (Node.js)
 *
 * Executes HTTP requests for API testing
 * Contributors can extend this for specific HTTP libraries or frameworks
 *
 * Action Type: HTTP_REQUEST
 */

const BaseExecutor = require("../core/base-executor");

class HTTPRequestExecutor extends BaseExecutor {
  getActionTypes() {
    return ["HTTP_REQUEST"];
  }

  async execute(parameters, globalConfig) {
    this.validateParameters(parameters, ["url", "method"]);

    const {
      url,
      method,
      headers = {},
      body,
      expectedStatus = [200, 201],
      timeout = 30000,
    } = parameters;

    // Use native fetch (Node 18+) or fallback
    const fetchImpl = globalThis.fetch || require("node-fetch");

    const requestOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
    };

    if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      requestOptions.body =
        typeof body === "string" ? body : JSON.stringify(body);
    }

    try {
      const startTime = Date.now();
      const response = await fetchImpl(url, requestOptions);
      const responseTime = Date.now() - startTime;

      // Parse response body
      const contentType = response.headers.get("content-type");
      let responseBody;

      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const result = {
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        body: responseBody,
        responseTime,
        timestamp: new Date().toISOString(),
        expectedStatus,
      };

      // Check if status code is acceptable
      if (expectedStatus.includes(response.status)) {
        return result;
      } else {
        const error = new Error(
          `HTTP ${response.status} ${
            response.statusText
          }. Expected: ${expectedStatus.join(", ")}`
        );
        error.result = result;
        throw error;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`HTTP request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
}

module.exports = HTTPRequestExecutor;
