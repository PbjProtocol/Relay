import type { HttpClient } from "../http/http-client";
import type {
  PaginatedResponse,
  PaginationParams,
  TransactionConfirmation,
} from "../types/common";
import type {
  Milestone,
  MilestoneInput,
  MilestoneStatus,
  MilestoneSubmission,
  ReleaseTransaction,
  SubmitMilestoneInput,
} from "../types/milestone";
import { paginate } from "../utils/pagination";
import {
  requireAmount,
  requireIsoDate,
  requireString,
  validatePagination,
} from "../utils/validation";
/** Milestone delivery and release operations. */
export class MilestoneService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Adds a milestone. */ create(
    input: MilestoneInput & { projectId: string; idempotencyKey?: string },
    signal?: AbortSignal,
  ): Promise<Milestone> {
    requireAmount(input.amount);
    requireIsoDate(input.dueAt, "dueAt");
    return this.http.request("/v1/milestones", {
      method: "POST",
      body: input,
      idempotencyKey: input.idempotencyKey,
      signal,
    });
  }
  /** Gets a milestone. */ get(
    id: string,
    signal?: AbortSignal,
  ): Promise<Milestone> {
    requireString(id, "milestoneId");
    return this.http.request(`/v1/milestones/${encodeURIComponent(id)}`, {
      signal,
    });
  }
  /** Lists milestones. */ list(
    params: PaginationParams & {
      projectId?: string;
      status?: MilestoneStatus[];
    } = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Milestone>> {
    validatePagination(params.page, params.limit);
    return this.http.request("/v1/milestones", { query: params, signal });
  }
  /** Iterates milestones across every page. */ iterate(
    params: Omit<
      PaginationParams & { projectId?: string; status?: MilestoneStatus[] },
      "page"
    > = {},
    signal?: AbortSignal,
  ): AsyncGenerator<Milestone, void, void> {
    return paginate((page) => this.list({ ...params, page }, signal));
  }
  /** Submits milestone delivery evidence. */ submit(
    input: SubmitMilestoneInput,
    signal?: AbortSignal,
  ): Promise<MilestoneSubmission> {
    requireString(input.summary, "summary");
    if (input.evidence.length === 0)
      throw new Error("At least one evidence item is required");
    return this.http.request(
      `/v1/milestones/${encodeURIComponent(input.milestoneId)}/submissions`,
      {
        method: "POST",
        body: input,
        idempotencyKey: input.idempotencyKey,
        signal,
      },
    );
  }
  /** Prepares an unsigned release transaction. */ prepareRelease(
    input: { milestoneId: string },
    signal?: AbortSignal,
  ): Promise<ReleaseTransaction> {
    return this.http.request(
      `/v1/milestones/${encodeURIComponent(input.milestoneId)}/release/prepare`,
      { method: "POST", body: input, signal },
    );
  }
  /** Confirms a release transaction without automatic retries. */ confirmRelease(
    input: { milestoneId: string; signature: string },
    signal?: AbortSignal,
  ): Promise<TransactionConfirmation> {
    requireString(input.signature, "signature");
    return this.http.request(
      `/v1/milestones/${encodeURIComponent(input.milestoneId)}/release/confirm`,
      { method: "POST", body: input, signal, transactionSubmission: true },
    );
  }
  /** Requests changes to a delivery. */ requestChanges(
    input: { milestoneId: string; reason: string },
    signal?: AbortSignal,
  ): Promise<Milestone> {
    requireString(input.reason, "reason");
    return this.http.request(
      `/v1/milestones/${encodeURIComponent(input.milestoneId)}/request-changes`,
      { method: "POST", body: input, signal },
    );
  }
}
