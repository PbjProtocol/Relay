import type { HttpClient } from "../http/http-client";
import type { PaginatedResponse, PaginationParams } from "../types/common";
import type {
  CreateDisputeInput,
  Dispute,
  DisputeListParams,
  DisputeTimelineEvent,
} from "../types/dispute";
import { requireString, validatePagination } from "../utils/validation";
/** Dispute evidence, statements, and resolution operations. */
export class DisputeService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Opens a dispute. */ create(
    input: CreateDisputeInput,
    signal?: AbortSignal,
  ): Promise<Dispute> {
    requireString(input.reason, "reason");
    requireString(input.statement, "statement");
    return this.http.request("/v1/disputes", {
      method: "POST",
      body: input,
      idempotencyKey: input.idempotencyKey,
      signal,
    });
  }
  /** Gets a dispute. */ get(
    id: string,
    signal?: AbortSignal,
  ): Promise<Dispute> {
    return this.http.request(`/v1/disputes/${encodeURIComponent(id)}`, {
      signal,
    });
  }
  /** Lists disputes. */ list(
    params: DisputeListParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<Dispute>> {
    validatePagination(params.page, params.limit);
    return this.http.request("/v1/disputes", {
      query: {
        ...params,
        status:
          params.status === undefined
            ? undefined
            : Array.isArray(params.status)
              ? params.status
              : [params.status],
      },
      signal,
    });
  }
  /** Adds evidence to an open dispute. */ addEvidence(
    input: { disputeId: string; evidenceIds: string[] },
    signal?: AbortSignal,
  ): Promise<Dispute> {
    return this.http.request(
      `/v1/disputes/${encodeURIComponent(input.disputeId)}/evidence`,
      { method: "POST", body: input, signal },
    );
  }
  /** Adds a statement. */ addStatement(
    input: { disputeId: string; statement: string },
    signal?: AbortSignal,
  ): Promise<Dispute> {
    requireString(input.statement, "statement");
    return this.http.request(
      `/v1/disputes/${encodeURIComponent(input.disputeId)}/statements`,
      { method: "POST", body: input, signal },
    );
  }
  /** Resolves a dispute as its authorized resolver. */ resolve(
    input: {
      disputeId: string;
      outcome: "client" | "freelancer" | "split";
      statement: string;
      clientAmount?: string;
      freelancerAmount?: string;
    },
    signal?: AbortSignal,
  ): Promise<Dispute> {
    return this.http.request(
      `/v1/disputes/${encodeURIComponent(input.disputeId)}/resolve`,
      { method: "POST", body: input, signal },
    );
  }
  /** Gets the dispute audit timeline. */ getTimeline(
    id: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<DisputeTimelineEvent>> {
    return this.http.request(
      `/v1/disputes/${encodeURIComponent(id)}/timeline`,
      { query: params, signal },
    );
  }
}
