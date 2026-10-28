/** GitHub repository attachment. */ export interface GitHubRepositoryAttachment {
  projectId: string;
  repository: string;
}
/** Figma file attachment. */ export interface FigmaFileAttachment {
  projectId: string;
  fileKey: string;
}
/** Drive file attachment. */ export interface GoogleDriveFileAttachment {
  projectId: string;
  fileId: string;
}
/** Integration activity entry. */ export interface IntegrationActivity {
  id: string;
  type: string;
  occurredAt: string;
  metadata: Record<string, unknown>;
}
