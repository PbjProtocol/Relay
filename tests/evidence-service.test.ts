import { describe, expect, it } from "vitest";
import { RelayClient } from "../src";
import { fetchMock, json } from "./helpers";
describe("EvidenceService", () => {
  it("verifies checksums", async () => {
    const client = new RelayClient({
      apiKey: "x",
      fetch: fetchMock(json({ valid: true })),
    });
    await expect(
      client.evidence.verifyChecksum({ evidenceId: "e", checksum: "abc" }),
    ).resolves.toEqual({ valid: true });
  });
});
