import { RelayClient } from "../../src";
const relay = new RelayClient({
  apiKey: process.env.RELAY_API_KEY!,
  network: "devnet",
});
const submission = await relay.milestones.submit({
  milestoneId: process.env.RELAY_MILESTONE_ID!,
  summary: "Final files and handoff documentation",
  evidence: [
    {
      type: "url",
      url: "https://example.com/delivery",
      label: "Delivery package",
    },
    {
      type: "github",
      repository: "pbjprotocol/example-project",
      commitSha: process.env.GITHUB_COMMIT_SHA!,
    },
  ],
  idempotencyKey: "milestone-delivery-001",
});
console.log("Submitted:", submission.id);
