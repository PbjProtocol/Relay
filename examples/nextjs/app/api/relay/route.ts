import { RelayClient } from "@pbjpro/relay";
export async function GET(): Promise<Response> {
  const relay = new RelayClient({
    apiKey: process.env.RELAY_API_KEY!,
    network: "devnet",
  });
  return Response.json(await relay.escrows.list({ limit: 20 }));
}
