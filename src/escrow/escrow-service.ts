import type { HttpClient } from "../http/http-client";
import type {
  ActivityEvent,
  PaginatedResponse,
  PaginationParams,
  TransactionConfirmation,
} from "../types/common";
import type {
  CreateProjectInput,
  EscrowBalance,
  FundingTransaction,
  ProjectListParams,
  RelayProject,
} from "../types/escrow";
import {
  requireAmount,
  requireIsoDate,
  requireString,
  requireWallet,
  validatePagination,
} from "../utils/validation";
/** Escrow project and funding operations. */
export class EscrowService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Creates an escrow project. */ async create(
    input: CreateProjectInput,
    signal?: AbortSignal,
  ): Promise<RelayProject> {
    validateProject(input);
    return this.http.request("/v1/escrows", {
      method: "POST",
      body: input,
      idempotencyKey: input.idempotencyKey,
      signal,
    });
  }
  /** Gets a project. */ get(
    projectId: string,
    signal?: AbortSignal,
  ): Promise<RelayProject> {
    requireString(projectId, "projectId");
    return this.http.request(`/v1/escrows/${encodeURIComponent(projectId)}`, {
      signal,
    });
  }
  /** Lists projects. */ list(
    params: ProjectListParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<RelayProject>> {
    validatePagination(params.page, params.limit);
    return this.http.request("/v1/escrows", {
      query: { ...params, status: arrayValue(params.status) },
      signal,
    });
  }
  /** Prepares an unsigned USDC funding transaction. */ prepareFunding(
    input: { projectId: string; amount: string },
    signal?: AbortSignal,
  ): Promise<FundingTransaction> {
    requireString(input.projectId, "projectId");
    requireAmount(input.amount);
    return this.http.request(
      `/v1/escrows/${encodeURIComponent(input.projectId)}/funding/prepare`,
      { method: "POST", body: input, signal },
    );
  }
  /** Confirms a submitted funding transaction without retrying it. */ confirmFunding(
    input: { projectId: string; signature: string },
    signal?: AbortSignal,
  ): Promise<TransactionConfirmation> {
    requireString(input.signature, "signature");
    return this.http.request(
      `/v1/escrows/${encodeURIComponent(input.projectId)}/funding/confirm`,
      { method: "POST", body: input, signal, transactionSubmission: true },
    );
  }
  /** Cancels an eligible project. */ cancel(
    projectId: string,
    reason?: string,
    signal?: AbortSignal,
  ): Promise<RelayProject> {
    return this.http.request(
      `/v1/escrows/${encodeURIComponent(projectId)}/cancel`,
      { method: "POST", body: { reason }, signal },
    );
  }
  /** Gets escrow balances. */ getBalance(
    projectId: string,
    signal?: AbortSignal,
  ): Promise<EscrowBalance> {
    return this.http.request(
      `/v1/escrows/${encodeURIComponent(projectId)}/balance`,
      { signal },
    );
  }
  /** Gets project activity. */ getActivity(
    projectId: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<ActivityEvent>> {
    validatePagination(params.page, params.limit);
    return this.http.request(
      `/v1/escrows/${encodeURIComponent(projectId)}/activity`,
      { query: params, signal },
    );
  }
}
function arrayValue<T>(value: T | T[] | undefined): T[] | undefined {
  return value === undefined
    ? undefined
    : Array.isArray(value)
      ? value
      : [value];
}
function validateProject(input: CreateProjectInput): void {
  requireString(input.name, "name");
  requireWallet(input.clientWallet, "clientWallet");
  requireWallet(input.freelancerWallet, "freelancerWallet");
  requireWallet(input.resolverWallet, "resolverWallet");
  if (input.milestones.length === 0)
    throw new Error("At least one milestone is required");
  input.milestones.forEach((m, i) => {
    requireString(m.title, `milestones[${i}].title`);
    requireAmount(m.amount, `milestones[${i}].amount`);
    requireIsoDate(m.dueAt, `milestones[${i}].dueAt`);
  });
}
