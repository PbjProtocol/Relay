import {
  RelayTimeoutError,
  RelayTransactionError,
} from "../errors/relay-error";
import type { HttpClient } from "../http/http-client";
import type { RelayNetwork, TransactionConfirmation } from "../types/common";
import { isWalletAddress } from "../utils/validation";
const USDC = {
  devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;
/** Solana network utilities and confirmation polling. */ export class SolanaService {
  private readonly rpc: string;
  /** Creates the service. */ constructor(
    private readonly http: HttpClient,
    private readonly network: RelayNetwork,
    rpcUrl?: string,
  ) {
    this.rpc =
      rpcUrl ??
      (network === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com");
  }
  /** Gets the exact configured network. */ getNetwork(): RelayNetwork {
    return this.network;
  }
  /** Gets the configured RPC endpoint. */ getRpcEndpoint(): string {
    return this.rpc;
  }
  /** Gets the canonical USDC mint. */ getUSDCMint(): string {
    return USDC[this.network];
  }
  /** Gets a transaction's Relay-observed status. */ getTransactionStatus(
    signature: string,
    signal?: AbortSignal,
  ): Promise<TransactionConfirmation> {
    return this.http.request(
      `/v1/solana/transactions/${encodeURIComponent(signature)}`,
      { signal },
    );
  }
  /** Waits until a transaction confirms, fails, aborts, or times out. */ async waitForConfirmation(
    signature: string,
    options: {
      timeoutMs?: number;
      pollIntervalMs?: number;
      signal?: AbortSignal;
    } = {},
  ): Promise<TransactionConfirmation> {
    const deadline = Date.now() + (options.timeoutMs ?? 60_000);
    while (Date.now() < deadline) {
      const status = await this.getTransactionStatus(signature, options.signal);
      if (status.status === "confirmed" || status.status === "finalized")
        return status;
      if (status.status === "failed")
        throw new RelayTransactionError(
          status.error ?? "Transaction failed",
          { code: "TRANSACTION_FAILED", details: { signature } },
          signature,
        );
      await new Promise((resolve) =>
        setTimeout(resolve, options.pollIntervalMs ?? 1_000),
      );
    }
    throw new RelayTimeoutError(
      "Timed out waiting for transaction confirmation",
      { code: "TRANSACTION_TIMEOUT", retryable: true, details: { signature } },
    );
  }
  /** Checks a base58 Solana public key. */ validateWalletAddress(
    address: string,
  ): boolean {
    return isWalletAddress(address);
  }
}
