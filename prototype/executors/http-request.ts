/**
 * HTTP Request Executor (Node.js)
 *
 * Executes HTTP requests for API testing
 * Contributors can extend this for specific HTTP libraries or frameworks
 *
 * Action Type: HTTP_REQUEST
 */

import { BaseExecutor, ExecutorConfig, ExecutionResult } from "../core/base-executor";

interface HTTPRequestParameters {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus?: number[];
  timeout?: number;
}

interface HTTPRequestResult {
  url: string;
  method: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
  timestamp: string;
  expectedStatus: number[];
}

export class HTTPRequestExecutor extends BaseExecutor {
  getActionTypes(): string[] {
    return ["HTTP_REQUEST"];
  }

  async execute(
    parameters: HTTPRequestParameters,
    globalConfig: ExecutorConfig
  ): Promise<ExecutionResult> {
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
    const fetchImpl = (globalThis as any).fetch || require("node-fetch");

    const requestOptions: any = {
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
      let responseBody: any;

      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const result: HTTPRequestResult = {
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
        return { success: true, data: result };
      } else {
        const error: any = new Error(
          `HTTP ${response.status} ${
            response.statusText
          }. Expected: ${expectedStatus.join(", ")}`
        );
        error.result = result;
        throw error;
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`HTTP request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
}

export default HTTPRequestExecutor;
