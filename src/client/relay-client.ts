import { RelayValidationError } from "../errors/relay-error";
import { EvidenceService } from "../evidence/evidence-service";
import { DisputeService } from "../disputes/dispute-service";
import { EscrowService } from "../escrow/escrow-service";
import { HttpClient } from "../http/http-client";
import { FigmaService } from "../integrations/figma-service";
import { GitHubService } from "../integrations/github-service";
import { GoogleDriveService } from "../integrations/google-drive-service";
import { MilestoneService } from "../milestones/milestone-service";
import { SolanaService } from "../solana/solana-service";
import type { RelayClientConfig, RelayNetwork } from "../types/common";
import { requireString } from "../utils/validation";
/** Top-level Relay SDK client. */
export class RelayClient {
  /** Escrow projects and funding. */ readonly escrows: EscrowService;
  /** Milestone submissions and releases. */ readonly milestones: MilestoneService;
  /** Delivery evidence. */ readonly evidence: EvidenceService;
  /** Dispute workflows. */ readonly disputes: DisputeService;
  /** External evidence integrations. */ readonly integrations: {
    github: GitHubService;
    figma: FigmaService;
    googleDrive: GoogleDriveService;
  };
  /** Solana helpers. */ readonly solana: SolanaService;
  /** Active Relay network. */ readonly network: RelayNetwork;
  /** Creates a Relay SDK client. Mainnet requires `confirmMainnet: true`. */
  constructor(config: RelayClientConfig) {
    requireString(config.apiKey, "apiKey");
    this.network = config.network ?? "devnet";
    if (this.network === "mainnet" && config.confirmMainnet !== true)
      throw new RelayValidationError("Mainnet requires confirmMainnet: true", {
        code: "MAINNET_CONFIRMATION_REQUIRED",
      });
    const http = new HttpClient(config);
    this.escrows = new EscrowService(http);
    this.milestones = new MilestoneService(http);
    this.evidence = new EvidenceService(http);
    this.disputes = new DisputeService(http);
    this.integrations = {
      github: new GitHubService(http),
      figma: new FigmaService(http),
      googleDrive: new GoogleDriveService(http),
    };
    this.solana = new SolanaService(
      http,
      this.network,
      this.network === "devnet" ? config.devnetRpcUrl : config.mainnetRpcUrl,
    );
  }
}
