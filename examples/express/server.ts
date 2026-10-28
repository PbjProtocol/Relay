import { createServer } from "node:http";
import { RelayClient, RelayError } from "../../src";
const relay = new RelayClient({
  apiKey: process.env.RELAY_API_KEY!,
  network: "devnet",
});
createServer(async (request, response) => {
  if (request.url !== "/relay/projects") {
    response.writeHead(404).end();
    return;
  }
  try {
    const projects = await relay.escrows.list({ limit: 20 });
    response
      .writeHead(200, { "content-type": "application/json" })
      .end(JSON.stringify(projects));
  } catch (error) {
    const status =
      error instanceof RelayError ? (error.statusCode ?? 500) : 500;
    response.writeHead(status, { "content-type": "application/json" }).end(
      JSON.stringify({
        error: error instanceof RelayError ? error.code : "INTERNAL_ERROR",
      }),
    );
  }
}).listen(3000, () => console.log("Listening on http://localhost:3000"));
