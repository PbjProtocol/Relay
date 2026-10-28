import type { RelayNetwork, TransactionConfirmation } from "./common";
/** Solana transaction state. */ export type SolanaTransactionStatus =
  TransactionConfirmation;
/** Solana configuration. */ export interface SolanaConfig {
  network: RelayNetwork;
  devnetRpcUrl?: string;
  mainnetRpcUrl?: string;
}
