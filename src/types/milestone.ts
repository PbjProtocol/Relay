import type { Timestamped } from "./common";
import type { DeliveryEvidence, EvidenceInput } from "./evidence";
/** Milestone lifecycle state. */ export type MilestoneStatus =
  | "pending"
  | "funded"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "released"
  | "in_dispute"
  | "cancelled";
/** Milestone definition input. */ export interface MilestoneInput {
  title: string;
  amount: string;
  description: string;
  dueAt: string;
}
/** Escrow milestone. */ export interface Milestone extends Timestamped {
  id: string;
  projectId: string;
  title: string;
  amount: string;
  description: string;
  dueAt: string;
  status: MilestoneStatus;
}
/** Submitted delivery. */ export interface MilestoneSubmission extends Timestamped {
  id: string;
  milestoneId: string;
  summary: string;
  evidence: DeliveryEvidence[];
}
/** Milestone submission input. */ export interface SubmitMilestoneInput {
  milestoneId: string;
  summary: string;
  evidence: EvidenceInput[];
  idempotencyKey?: string;
}
/** Prepared release transaction. */ export interface ReleaseTransaction {
  milestoneId: string;
  transaction: Uint8Array;
  expiresAt?: string;
}
