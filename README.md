# `Milestone Escrow Protocol on Solana`

  
![enter image description here](https://cyan-worried-mite-516.mypinata.cloud/ipfs/bafkreieqsywmgjdhkg77ligv6ovthbsryqduyszs66ijnrnygdna33xwgm)

Production TypeScript SDK for Relay, PBJ Protocol's USDC milestone escrow API on Solana. Relay helps applications, agencies, clients, and independent teams define deliverables, preserve evidence, fund escrow, approve work, release payments, and resolve disputes.

  

>  **Warning**

> Relay enforces payment and approval rules, but it cannot independently determine whether subjective creative or software work meets expectations. Every project should define clear milestone requirements and select a dispute resolver before funding.

  

## Installation

  

```sh

npm  i  @pbjpro/relay

```

  

## Requirements and supported runtimes

  

Node.js 20+ or a modern browser with native `fetch`, `AbortController`, and Web APIs. The package ships ESM, CommonJS, declarations, and source maps. Keep API keys on trusted servers; never embed privileged keys in browser bundles.

  

## Quick start

  

```ts

import  { RelayClient }  from  "@pbjpro/relay";

  

const  relay = new  RelayClient({

apiKey: process.env.RELAY_API_KEY!,

baseUrl: process.env.RELAY_API_URL,

network:  "devnet",

});

```

  

## Authentication

  

Create a server-side Relay API key and pass it as `apiKey`. The SDK sends it as a bearer credential and redacts it from request hooks. Rotate compromised keys immediately.

  

## Devnet and mainnet configuration

  

`devnet` and `https://api.0xpbj.pro` are safe defaults. Mainnet never falls back and requires explicit confirmation:

  

```ts

const  relay = new  RelayClient({

apiKey,

network:  "mainnet",

confirmMainnet:  true,

});

```

  

Custom `baseUrl`, `devnetRpcUrl`, and `mainnetRpcUrl` values support local and private infrastructure.

  

## Creating an escrow project

  

```ts

const  project = await  relay.escrows.create({

name:  "Brand redesign",

clientWallet:  "CLIENT_SOLANA_ADDRESS",

freelancerWallet:  "FREELANCER_SOLANA_ADDRESS",

resolverWallet:  "RESOLVER_SOLANA_ADDRESS",

currency:  "USDC",

milestones: [

{

title:  "Research",

amount:  "1500.00",

description:  "Approved direction",

dueAt:  "2027-01-31T00:00:00.000Z",

},

{

title:  "Delivery",

amount:  "3500.00",

description:  "Final files",

dueAt:  "2027-02-28T00:00:00.000Z",

},

],

disputePolicy: {

resolverType:  "human",

inactivityTimeoutHours:  168,

evidenceWindowHours:  72,

},

idempotencyKey:  "brand-redesign-001",

});

```

  

## Funding escrow with USDC

  

```ts

const  funding = await  relay.escrows.prepareFunding({

projectId: project.id,

amount:  "5000.00",

});

const  signature = await  wallet.sendTransaction(funding.transaction);

await  relay.escrows.confirmFunding({ projectId: project.id, signature });

```

  

Amounts are always decimal strings, never JavaScript numbers.

  

## Submitting milestone evidence

  

```ts

const  submission = await  relay.milestones.submit({

milestoneId:  "milestone_id",

summary:  "Final files and handoff",

evidence: [

{ type:  "url", url:  "https://example.com/delivery", label:  "Package" },

{

type:  "github",

repository:  "pbjprotocol/example",

commitSha:  "FULL_COMMIT_SHA",

},

{ type:  "figma", fileKey:  "FILE_KEY", versionId:  "VERSION_ID" },

{ type:  "google_drive", fileId:  "FILE_ID", checksum:  "SHA256_CHECKSUM" },

],

idempotencyKey:  "delivery-001",

});

```

  

## Approving and releasing payments

  

```ts

const  prepared = await  relay.milestones.prepareRelease({

milestoneId: submission.milestoneId,

});

const  signature = await  wallet.sendTransaction(prepared.transaction);

await  relay.milestones.confirmRelease({

milestoneId: submission.milestoneId,

signature,

});

```

  

Confirmation endpoints are never automatically retried.

  

## Opening and resolving disputes

  

```ts

const  dispute = await  relay.disputes.create({

milestoneId:  "milestone_id",

reason:  "delivery_does_not_match_scope",

statement:  "Responsive layouts are missing.",

evidenceIds: ["e1"],

idempotencyKey:  "dispute-001",

});

await  relay.disputes.resolve({

disputeId: dispute.id,

outcome:  "split",

statement:  "Partial completion",

clientAmount:  "2500.00",

freelancerAmount:  "2500.00",

});

```

  

## GitHub evidence integration

  

Use `relay.integrations.github.attachRepository()`, `attachCommit()`, and `getDeliveryActivity()` to bind repositories and immutable commits.

  

## Figma evidence integration

  

Use `relay.integrations.figma.attachFile()`, `attachVersion()`, `getFrozenPreview()`, and `getComments()` to preserve a reviewed design version.

  

## Google Drive evidence integration

  

Use `relay.integrations.googleDrive.attachFile()`, `attachFolder()`, `getVersionMetadata()`, and `verifyChecksum()` for Drive deliverables.

  

## Pagination and async iteration

  

```ts

const  page = await  relay.milestones.list({

projectId: project.id,

status: ["submitted"],

page:  1,

limit:  20,

});

for  await (const  milestone  of  relay.milestones.iterate({

projectId: project.id,

}))

console.log(milestone.id);

```

  

## Error handling

  

```ts

import  {

RelayAuthenticationError,

RelayClient,

RelayTransactionError,

}  from  "@pbjpro/relay";

const  relay = new  RelayClient({

apiKey: process.env.RELAY_API_KEY!,

network:  "devnet",

});

try  {

const  project  =  await relay.escrows.create({

name:  "Website",

clientWallet: process.env.CLIENT_WALLET!,

freelancerWallet: process.env.FREELANCER_WALLET!,

resolverWallet: process.env.RESOLVER_WALLET!,

currency:  "USDC",

milestones: [

{

title:  "Launch",

amount:  "1000.00",

description:  "Production launch",

dueAt:  "2027-03-01T00:00:00.000Z",

},

],

disputePolicy: {

resolverType:  "human",

inactivityTimeoutHours:  168,

evidenceWindowHours:  72,

},

idempotencyKey:  "website-001",

});

console.log("Created project:", project.id);

}  catch (error) {

if (error instanceof  RelayAuthenticationError)

console.error("Check RELAY_API_KEY");

else  if (error instanceof  RelayTransactionError)

console.error("Transaction failed:", error.signature);

else  throw error;

}

```

  

All typed errors expose `code`, `message`, `retryable`, and optional `statusCode`, `requestId`, `cause`, and structured `details`.

  

## Idempotency

  

Supply a unique `idempotencyKey` for create and submission workflows. The transport retries unsafe HTTP verbs only when an idempotency key makes the operation safe; blockchain submission confirmations never retry.

  

## Security recommendations

  

Keep API and integration tokens server-side, use least privilege, validate wallet addresses, pin evidence checksums, avoid logging request bodies, use HTTPS, review mainnet configuration, and never store private keys in Relay configuration. Wallet signing remains outside this SDK.

  

## Next.js example

  

See `examples/nextjs`: initialize Relay only in a route handler using `RELAY_API_KEY`; the page calls that server route and never receives the key.

  

## Express example

  

See `examples/express/server.ts` for a dependency-free Node HTTP endpoint with typed Relay errors.

  

## API reference

  

-  `relay.escrows`: `create`, `get`, `list`, `prepareFunding`, `confirmFunding`, `cancel`, `getBalance`, `getActivity`

-  `relay.milestones`: `create`, `get`, `list`, `iterate`, `submit`, `prepareRelease`, `confirmRelease`, `requestChanges`

-  `relay.evidence`: `create`, `get`, `list`, `refresh`, `getFrozenPreview`, `verifyChecksum`

-  `relay.disputes`: `create`, `get`, `list`, `addEvidence`, `addStatement`, `resolve`, `getTimeline`

-  `relay.integrations`: GitHub, Figma, and Google Drive services

-  `relay.solana`: network, RPC, USDC mint, transaction status/confirmation, and wallet validation

  

## Development commands

  

Run `npm run build`, `dev`, `typecheck`, `lint`, `test`, `test:coverage`, `format`, or `format:check`.

  

## Publishing instructions

  

Update the changelog/version, run `npm ci`, `npm run prepublishOnly`, and `npm pack --dry-run`, inspect the file list, then run `npm publish --access public` with an authorized npm account.

  

## License

  

MIT © PBJ Protocol. See [LICENSE](LICENSE).