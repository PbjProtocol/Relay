import { RelayClient } from "../../src";
const relay = new RelayClient({
  apiKey: process.env.RELAY_API_KEY!,
  network: "devnet",
});
const projectId = process.env.RELAY_PROJECT_ID!;
const funding = await relay.escrows.prepareFunding({
  projectId,
  amount: "5000.00",
});
console.log(
  "Sign these transaction bytes in your wallet:",
  funding.transaction,
);
console.log("Then call confirmFunding with the resulting signature.");
