import type { HttpClient } from "../http/http-client";
import type { PaginatedResponse, PaginationParams } from "../types/common";
import type {
  DeliveryEvidence,
  EvidenceInput,
  FrozenPreview,
} from "../types/evidence";
import { requireString, validatePagination } from "../utils/validation";
/** Delivery evidence operations. */
export class EvidenceService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Creates evidence. */ create(
    input: {
      milestoneId: string;
      evidence: EvidenceInput;
      idempotencyKey?: string;
    },
    signal?: AbortSignal,
  ): Promise<DeliveryEvidence> {
    return this.http.request("/v1/evidence", {
      method: "POST",
      body: input,
      idempotencyKey: input.idempotencyKey,
      signal,
    });
  }
  /** Gets evidence. */ get(
    id: string,
    signal?: AbortSignal,
  ): Promise<DeliveryEvidence> {
    return this.http.request(`/v1/evidence/${encodeURIComponent(id)}`, {
      signal,
    });
  }
  /** Lists evidence. */ list(
    params: PaginationParams & { milestoneId?: string } = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<DeliveryEvidence>> {
    validatePagination(params.page, params.limit);
    return this.http.request("/v1/evidence", { query: params, signal });
  }
  /** Refreshes a mutable evidence source into a new snapshot. */ refresh(
    id: string,
    signal?: AbortSignal,
  ): Promise<DeliveryEvidence> {
    return this.http.request(`/v1/evidence/${encodeURIComponent(id)}/refresh`, {
      method: "POST",
      signal,
    });
  }
  /** Gets an immutable preview. */ getFrozenPreview(
    id: string,
    signal?: AbortSignal,
  ): Promise<FrozenPreview> {
    return this.http.request(`/v1/evidence/${encodeURIComponent(id)}/preview`, {
      signal,
    });
  }
  /** Verifies evidence against a SHA-256 checksum. */ verifyChecksum(
    input: { evidenceId: string; checksum: string },
    signal?: AbortSignal,
  ): Promise<{ valid: boolean }> {
    requireString(input.checksum, "checksum");
    return this.http.request(
      `/v1/evidence/${encodeURIComponent(input.evidenceId)}/verify`,
      { method: "POST", body: input, signal },
    );
  }
}
