import { describe, expect, it } from "vitest";
import { RelayClient } from "../src";
import { fetchMock, json } from "./helpers";
describe("MilestoneService", () => {
  it("submits evidence", async () => {
    const client = new RelayClient({
      apiKey: "x",
      fetch: fetchMock(json({ id: "s", milestoneId: "m" })),
    });
    const result = await client.milestones.submit({
      milestoneId: "m",
      summary: "Done",
      evidence: [{ type: "url", url: "https://example.com" }],
      idempotencyKey: "submit-1",
    });
    expect(result.id).toBe("s");
  });
  it("never retries transaction confirmation", async () => {
    const fetcher = fetchMock(json({}, 503));
    const client = new RelayClient({
      apiKey: "x",
      fetch: fetcher,
      maxRetries: 3,
    });
    await expect(
      client.milestones.confirmRelease({ milestoneId: "m", signature: "sig" }),
    ).rejects.toBeTruthy();
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
