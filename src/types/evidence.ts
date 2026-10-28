import type { Timestamped } from "./common";
/** URL evidence. */ export interface UrlEvidence {
  type: "url";
  url: string;
  label?: string;
}
/** GitHub evidence. */ export interface GitHubEvidence {
  type: "github";
  repository: string;
  commitSha: string;
}
/** Figma evidence. */ export interface FigmaEvidence {
  type: "figma";
  fileKey: string;
  versionId: string;
}
/** Google Drive evidence. */ export interface GoogleDriveEvidence {
  type: "google_drive";
  fileId: string;
  checksum?: string;
}
/** Evidence accepted with a milestone. */ export type EvidenceInput =
  UrlEvidence | GitHubEvidence | FigmaEvidence | GoogleDriveEvidence;
/** Persisted, immutable delivery evidence. */ export interface DeliveryEvidence extends Timestamped {
  id: string;
  milestoneId: string;
  evidence: EvidenceInput;
  status: "processing" | "ready" | "failed";
  checksum?: string;
}
/** Frozen evidence preview. */ export interface FrozenPreview {
  evidenceId: string;
  url: string;
  contentType: string;
  checksum: string;
  capturedAt: string;
}
