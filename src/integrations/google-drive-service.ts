import type { HttpClient } from "../http/http-client";
import type { GoogleDriveEvidence } from "../types/evidence";
import type { GoogleDriveFileAttachment } from "../types/integration";
/** Google Drive delivery integration operations. */ export class GoogleDriveService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Attaches a file. */ attachFile(
    input: GoogleDriveFileAttachment,
    signal?: AbortSignal,
  ): Promise<GoogleDriveFileAttachment> {
    return this.http.request("/v1/integrations/google-drive/files", {
      method: "POST",
      body: input,
      signal,
    });
  }
  /** Attaches a folder. */ attachFolder(
    input: { projectId: string; folderId: string },
    signal?: AbortSignal,
  ): Promise<{ projectId: string; folderId: string }> {
    return this.http.request("/v1/integrations/google-drive/folders", {
      method: "POST",
      body: input,
      signal,
    });
  }
  /** Gets immutable version metadata. */ getVersionMetadata(
    fileId: string,
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>> {
    return this.http.request(
      `/v1/integrations/google-drive/files/${encodeURIComponent(fileId)}/version`,
      { signal },
    );
  }
  /** Verifies a Drive file checksum. */ verifyChecksum(
    input: Omit<GoogleDriveEvidence, "type"> & { checksum: string },
    signal?: AbortSignal,
  ): Promise<{ valid: boolean }> {
    return this.http.request(
      `/v1/integrations/google-drive/files/${encodeURIComponent(input.fileId)}/verify`,
      { method: "POST", body: input, signal },
    );
  }
}
