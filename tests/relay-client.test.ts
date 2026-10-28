import { describe, expect, it, vi } from "vitest";
import {
  RelayAuthenticationError,
  RelayClient,
  RelayRateLimitError,
  RelayTimeoutError,
  RelayValidationError,
} from "../src";
import { fetchMock, json } from "./helpers";
describe("RelayClient", () => {
  it("defaults to devnet and rejects unconfirmed mainnet", () => {
    expect(
      new RelayClient({
        apiKey: "test",
        fetch: fetchMock(),
      }).solana.getNetwork(),
    ).toBe("devnet");
    expect(
      () => new RelayClient({ apiKey: "test", network: "mainnet" }),
    ).toThrow(RelayValidationError);
  });
  it("maps authentication and rate limit failures", async () => {
    const auth = new RelayClient({
      apiKey: "secret",
      fetch: fetchMock(json({ message: "bad" }, 401)),
    });
    await expect(auth.escrows.get("p")).rejects.toBeInstanceOf(
      RelayAuthenticationError,
    );
    const rate = new RelayClient({
      apiKey: "secret",
      maxRetries: 0,
      fetch: fetchMock(json({ message: "slow" }, 429, { "retry-after": "1" })),
    });
    await expect(rate.escrows.get("p")).rejects.toBeInstanceOf(
      RelayRateLimitError,
    );
  });
  it("retries safe requests", async () => {
    const fetcher = fetchMock(json({}, 503), json({ id: "p" }));
    const client = new RelayClient({
      apiKey: "x",
      fetch: fetcher,
      maxRetries: 1,
    });
    await client.escrows.get("p");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("honors abort and timeout", async () => {
    const pending = vi.fn((_u: URL | RequestInfo, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const fail = () => reject(new DOMException("Aborted", "AbortError"));
        if (init?.signal?.aborted) fail();
        else init?.signal?.addEventListener("abort", fail);
      });
    }) as unknown as typeof fetch;
    const controller = new AbortController();
    const client = new RelayClient({
      apiKey: "x",
      fetch: pending,
      timeoutMs: 50,
    });
    const promise = client.escrows.get("p", controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ code: "ABORTED" });
    const timeoutClient = new RelayClient({
      apiKey: "x",
      fetch: pending,
      timeoutMs: 5,
      maxRetries: 0,
    });
    await expect(timeoutClient.escrows.get("p")).rejects.toBeInstanceOf(
      RelayTimeoutError,
    );
  });
  it("redacts credentials in hooks", async () => {
    let headers: Readonly<Record<string, string>> = {};
    const client = new RelayClient({
      apiKey: "super-secret",
      fetch: fetchMock(json({ id: "p" })),
      onRequest: (request) => {
        headers = request.headers;
      },
    });
    await client.escrows.get("p");
    expect(headers.Authorization).toBe("[REDACTED]");
    expect(JSON.stringify(headers)).not.toContain("super-secret");
  });
  it("rejects malformed success responses", async () => {
    const client = new RelayClient({
      apiKey: "x",
      fetch: fetchMock(new Response("bad", { status: 200 })),
    });
    await expect(client.escrows.get("p")).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
    });
  });
});
