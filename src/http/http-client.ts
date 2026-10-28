import {
  RelayApiError,
  RelayAuthenticationError,
  RelayConflictError,
  RelayNetworkError,
  RelayNotFoundError,
  RelayRateLimitError,
  RelayTimeoutError,
  RelayValidationError,
} from "../errors/relay-error";
import type {
  RelayClientConfig,
  RelayRequestInfo,
  RelayResponseInfo,
} from "../types/common";
/** HTTP request options. */ export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
  body?: unknown;
  query?: object | undefined;
  signal?: AbortSignal | undefined;
  idempotencyKey?: string | undefined;
  retry?: boolean | undefined;
  transactionSubmission?: boolean | undefined;
}
interface ErrorBody {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}
const SECRET_KEYS = /authorization|api[-_]?key|token|secret/i;
/** Redacts credential-shaped keys recursively. */ export function redact(
  value: unknown,
): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SECRET_KEYS.test(key) ? "[REDACTED]" : redact(item),
      ]),
    );
  return value;
}
/** Native-fetch Relay transport with retry, timeout, and typed errors. */
export class HttpClient {
  private readonly fetcher: typeof fetch;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly onRequest?: RelayClientConfig["onRequest"];
  private readonly onResponse?: RelayClientConfig["onResponse"];
  /** Creates the transport. */ constructor(config: RelayClientConfig) {
    this.fetcher = config.fetch ?? globalThis.fetch;
    this.baseUrl = (config.baseUrl ?? "https://api.0xpbj.pro").replace(
      /\/$/,
      "",
    );
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.maxRetries = config.maxRetries ?? 2;
    this.onRequest = config.onRequest;
    this.onResponse = config.onResponse;
  }
  /** Sends and decodes a JSON request. */ async request<T>(
    path: string,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    const method = options.method ?? "GET";
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined) continue;
      if (Array.isArray(value))
        value.forEach((item: unknown) =>
          url.searchParams.append(key, String(item)),
        );
      else url.searchParams.set(key, String(value));
    }
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "X-Relay-SDK": "js/1.2.1",
    };
    if (options.body !== undefined)
      headers["Content-Type"] = "application/json";
    if (options.idempotencyKey)
      headers["Idempotency-Key"] = options.idempotencyKey;
    const safe =
      method === "GET" ||
      method === "DELETE" ||
      Boolean(options.idempotencyKey);
    const attempts =
      options.transactionSubmission || options.retry === false || !safe
        ? 1
        : this.maxRetries + 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, this.timeoutMs);
      const abort = () => controller.abort();
      options.signal?.addEventListener("abort", abort, { once: true });
      try {
        const hookRequest: RelayRequestInfo = {
          url: url.toString(),
          method,
          headers: redact(headers) as Readonly<Record<string, string>>,
          ...(options.body === undefined ? {} : { body: redact(options.body) }),
        };
        await this.onRequest?.(hookRequest);
        const response = await this.fetcher(url, {
          method,
          headers,
          ...(options.body === undefined
            ? {}
            : { body: JSON.stringify(options.body) }),
          signal: controller.signal,
        });
        const requestId =
          response.headers.get("x-request-id") ??
          response.headers.get("x-relay-request-id") ??
          undefined;
        const hookResponse: RelayResponseInfo = {
          url: url.toString(),
          method,
          status: response.status,
          ...(requestId ? { requestId } : {}),
        };
        await this.onResponse?.(hookResponse);
        if (!response.ok) {
          const body = await parseBody<ErrorBody>(response);
          const error = mapHttpError(
            response.status,
            body,
            requestId,
            response.headers.get("retry-after"),
          );
          if (attempt + 1 < attempts && error.retryable) {
            await delay(
              retryDelay(attempt, response.headers.get("retry-after")),
              options.signal,
            );
            continue;
          }
          throw error;
        }
        if (response.status === 204) return undefined as T;
        return await parseBody<T>(response, true);
      } catch (error) {
        if (error instanceof RelayApiError) throw error;
        if (error instanceof RelayValidationError) throw error;
        if (options.signal?.aborted)
          throw new RelayNetworkError("Request aborted", {
            code: "ABORTED",
            retryable: false,
            cause: error,
          });
        if (timedOut)
          throw new RelayTimeoutError(
            `Request timed out after ${this.timeoutMs}ms`,
            { code: "TIMEOUT", retryable: true, cause: error },
          );
        if (attempt + 1 < attempts) {
          await delay(retryDelay(attempt, null), options.signal);
          continue;
        }
        throw new RelayNetworkError("Unable to reach Relay", {
          code: "NETWORK_ERROR",
          retryable: true,
          cause: error,
        });
      } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener("abort", abort);
      }
    }
    throw new RelayNetworkError("Request failed", {
      code: "NETWORK_ERROR",
      retryable: true,
    });
  }
}
async function parseBody<T>(response: Response, strict = false): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (cause) {
    if (strict)
      throw new RelayApiError("Relay returned malformed JSON", {
        code: "MALFORMED_RESPONSE",
        statusCode: response.status,
        retryable: false,
        cause,
      });
    return {} as T;
  }
}
function mapHttpError(
  status: number,
  body: ErrorBody,
  requestId: string | undefined,
  retryAfter: string | null,
): RelayApiError {
  const base = {
    code: body.code ?? `HTTP_${status}`,
    statusCode: status,
    ...(requestId ? { requestId } : {}),
    details: body.details,
    retryable: status === 408 || status === 429 || status >= 500,
  };
  const message = body.message ?? `Relay request failed with status ${status}`;
  if (status === 401 || status === 403)
    return new RelayAuthenticationError(message, { ...base, retryable: false });
  if (status === 404)
    return new RelayNotFoundError(message, { ...base, retryable: false });
  if (status === 409)
    return new RelayConflictError(message, { ...base, retryable: false });
  if (status === 429)
    return new RelayRateLimitError(message, base, parseRetryAfter(retryAfter));
  return new RelayApiError(message, base);
}
function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}
function retryDelay(attempt: number, retryAfter: string | null): number {
  return (
    parseRetryAfter(retryAfter) ??
    Math.min(250 * 2 ** attempt + Math.random() * 100, 5_000)
  );
}
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
