import type {
  ActivityEvent,
  PaginatedResponse,
  PaginationParams,
  Timestamped,
} from "./common";
import type { Milestone, MilestoneInput } from "./milestone";
/** Dispute resolver policy. */ export interface DisputePolicy {
  resolverType: "human" | "automated";
  inactivityTimeoutHours: number;
  evidenceWindowHours: number;
}
/** Project creation input. */ export interface CreateProjectInput {
  name: string;
  clientWallet: string;
  freelancerWallet: string;
  resolverWallet: string;
  currency: "USDC";
  milestones: MilestoneInput[];
  disputePolicy: DisputePolicy;
  idempotencyKey?: string;
}
/** Relay escrow project. */ export interface RelayProject extends Timestamped {
  id: string;
  name: string;
  clientWallet: string;
  freelancerWallet: string;
  resolverWallet: string;
  currency: "USDC";
  network: "devnet" | "mainnet";
  status:
    | "draft"
    | "awaiting_funding"
    | "funded"
    | "active"
    | "completed"
    | "cancelled";
  milestones: Milestone[];
  disputePolicy: DisputePolicy;
}
/** On-chain escrow account. */ export interface EscrowAccount {
  projectId: string;
  address: string;
  usdcMint: string;
  network: "devnet" | "mainnet";
}
/** Escrow token balance; amounts are decimal strings. */ export interface EscrowBalance {
  projectId: string;
  available: string;
  committed: string;
  released: string;
  currency: "USDC";
}
/** Prepared funding transaction. */ export interface FundingTransaction {
  projectId: string;
  transaction: Uint8Array;
  amount: string;
  expiresAt?: string;
}
/** Project list filters. */ export interface ProjectListParams extends PaginationParams {
  status?: RelayProject["status"] | RelayProject["status"][];
}
/** Project activity page. */ export type ProjectActivity =
  PaginatedResponse<ActivityEvent>;
