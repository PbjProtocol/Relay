import type { HttpClient } from "../http/http-client";
import type { FigmaEvidence, FrozenPreview } from "../types/evidence";
import type { FigmaFileAttachment } from "../types/integration";
/** Figma delivery integration operations. */ export class FigmaService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Attaches a Figma file. */ attachFile(
    input: FigmaFileAttachment,
    signal?: AbortSignal,
  ): Promise<FigmaFileAttachment> {
    return this.http.request("/v1/integrations/figma/files", {
      method: "POST",
      body: input,
      signal,
    });
  }
  /** Attaches a specific version. */ attachVersion(
    input: Omit<FigmaEvidence, "type"> & { milestoneId: string },
    signal?: AbortSignal,
  ): Promise<FigmaEvidence> {
    return this.http.request("/v1/integrations/figma/versions", {
      method: "POST",
      body: input,
      signal,
    });
  }
  /** Gets a version's frozen preview. */ getFrozenPreview(
    fileKey: string,
    versionId: string,
    signal?: AbortSignal,
  ): Promise<FrozenPreview> {
    return this.http.request(
      `/v1/integrations/figma/files/${encodeURIComponent(fileKey)}/versions/${encodeURIComponent(versionId)}/preview`,
      { signal },
    );
  }
  /** Gets comments pinned to a file/version. */ getComments(
    fileKey: string,
    versionId?: string,
    signal?: AbortSignal,
  ): Promise<Array<{ id: string; message: string; createdAt: string }>> {
    return this.http.request(
      `/v1/integrations/figma/files/${encodeURIComponent(fileKey)}/comments`,
      { query: { versionId }, signal },
    );
  }
}
