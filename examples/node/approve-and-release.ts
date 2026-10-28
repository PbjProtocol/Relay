import { RelayClient } from "../../src";
const relay = new RelayClient({
  apiKey: process.env.RELAY_API_KEY!,
  network: "devnet",
});
const milestoneId = process.env.RELAY_MILESTONE_ID!;
const release = await relay.milestones.prepareRelease({ milestoneId });
console.log("Sign transaction:", release.transaction);
console.log(
  "Confirm with relay.milestones.confirmRelease after wallet signing.",
);
