import { RelayClient } from "../../src";
const relay = new RelayClient({
  apiKey: process.env.RELAY_API_KEY!,
  network: "devnet",
});
const dispute = await relay.disputes.create({
  milestoneId: process.env.RELAY_MILESTONE_ID!,
  reason: "delivery_does_not_match_scope",
  statement: "The delivery does not include the agreed responsive layouts.",
  evidenceIds: [],
  idempotencyKey: "dispute-001",
});
console.log("Opened dispute:", dispute.id);
