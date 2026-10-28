import type { PaginationParams, Timestamped } from "./common";
/** Dispute lifecycle state. */ export type DisputeStatus =
  "open" | "evidence" | "under_review" | "resolved" | "cancelled";
/** A milestone dispute. */ export interface Dispute extends Timestamped {
  id: string;
  milestoneId: string;
  reason: string;
  statement: string;
  evidenceIds: string[];
  status: DisputeStatus;
  resolution?: string;
}
/** Dispute timeline item. */ export interface DisputeTimelineEvent {
  id: string;
  disputeId: string;
  type: string;
  occurredAt: string;
  actor?: string;
  detail?: Record<string, unknown>;
}
/** Dispute creation input. */ export interface CreateDisputeInput {
  milestoneId: string;
  reason: string;
  statement: string;
  evidenceIds?: string[];
  idempotencyKey?: string;
}
/** Dispute list filters. */ export interface DisputeListParams extends PaginationParams {
  milestoneId?: string;
  status?: DisputeStatus | DisputeStatus[];
}
