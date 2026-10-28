import {
  RelayAuthenticationError,
  RelayClient,
  RelayTransactionError,
} from "../../src";
const relay = new RelayClient({
  apiKey: process.env.RELAY_API_KEY!,
  network: "devnet",
});
try {
  const project = await relay.escrows.create({
    name: "Brand redesign",
    clientWallet: process.env.CLIENT_WALLET!,
    freelancerWallet: process.env.FREELANCER_WALLET!,
    resolverWallet: process.env.RESOLVER_WALLET!,
    currency: "USDC",
    milestones: [
      {
        title: "Creative direction",
        amount: "1500.00",
        description: "Approved research and direction",
        dueAt: "2027-01-31T00:00:00.000Z",
      },
    ],
    disputePolicy: {
      resolverType: "human",
      inactivityTimeoutHours: 168,
      evidenceWindowHours: 72,
    },
    idempotencyKey: "brand-redesign-001",
  });
  console.log("Created project:", project.id);
} catch (error) {
  if (error instanceof RelayAuthenticationError)
    console.error("Check RELAY_API_KEY");
  else if (error instanceof RelayTransactionError)
    console.error("Transaction failed:", error.signature);
  else throw error;
}
