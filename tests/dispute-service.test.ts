import { describe, expect, it } from "vitest";
import { RelayClient } from "../src";
import { fetchMock, json } from "./helpers";
describe("DisputeService", () => {
  it("opens a dispute", async () => {
    const client = new RelayClient({
      apiKey: "x",
      fetch: fetchMock(json({ id: "d" })),
    });
    const dispute = await client.disputes.create({
      milestoneId: "m",
      reason: "scope",
      statement: "Missing files",
      idempotencyKey: "d1",
    });
    expect(dispute.id).toBe("d");
  });
});
