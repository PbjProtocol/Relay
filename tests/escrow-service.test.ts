import { describe, expect, it, vi } from "vitest";
import { RelayClient, RelayValidationError } from "../src";
import { fetchMock, json, wallet } from "./helpers";
describe("EscrowService", () => {
  it("creates projects and sends idempotency", async () => {
    const fetcher = fetchMock(json({ id: "p1" }));
    const client = new RelayClient({ apiKey: "x", fetch: fetcher });
    const result = await client.escrows.create({
      name: "Work",
      clientWallet: wallet,
      freelancerWallet: wallet,
      resolverWallet: wallet,
      currency: "USDC",
      milestones: [
        {
          title: "One",
          amount: "1.00",
          description: "Deliver",
          dueAt: "2027-01-01T00:00:00.000Z",
        },
      ],
      disputePolicy: {
        resolverType: "human",
        inactivityTimeoutHours: 168,
        evidenceWindowHours: 72,
      },
      idempotencyKey: "key",
    });
    expect(result.id).toBe("p1");
    expect(
      (vi.mocked(fetcher).mock.calls[0]?.[1] as RequestInit).headers,
    ).toMatchObject({
      "Idempotency-Key": "key",
    });
  });
  it("rejects floating point and invalid wallets", async () => {
    const client = new RelayClient({ apiKey: "x", fetch: fetchMock() });
    expect(() =>
      client.escrows.prepareFunding({ projectId: "p", amount: "1.1234567" }),
    ).toThrow(RelayValidationError);
  });
});
