/** Relay cluster selection. */
export type RelayNetwork = "devnet" | "mainnet";
/** Page request parameters. */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
/** A page returned by Relay. */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
/** Hook-safe request metadata (authorization is redacted). */
export interface RelayRequestInfo {
  url: string;
  method: string;
  headers: Readonly<Record<string, string>>;
  body?: unknown;
}
/** Hook-safe response metadata. */
export interface RelayResponseInfo {
  url: string;
  method: string;
  status: number;
  requestId?: string;
}
/** SDK client configuration. */
export interface RelayClientConfig {
  apiKey: string;
  baseUrl?: string;
  network?: RelayNetwork;
  timeoutMs?: number;
  maxRetries?: number;
  confirmMainnet?: boolean;
  fetch?: typeof globalThis.fetch;
  onRequest?: (request: RelayRequestInfo) => void | Promise<void>;
  onResponse?: (response: RelayResponseInfo) => void | Promise<void>;
  devnetRpcUrl?: string;
  mainnetRpcUrl?: string;
}
/** ISO timestamped resource. */
export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}
/** Generic activity record. */
export interface ActivityEvent {
  id: string;
  type: string;
  actor?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}
/** A confirmed on-chain transaction. */
export interface TransactionConfirmation {
  signature: string;
  status: "pending" | "confirmed" | "finalized" | "failed";
  slot?: number;
  error?: string;
}
