import type { HttpClient } from "../http/http-client";
import type { GitHubEvidence } from "../types/evidence";
import type {
  GitHubRepositoryAttachment,
  IntegrationActivity,
} from "../types/integration";
/** GitHub delivery integration operations. */ export class GitHubService {
  /** Creates the service. */ constructor(private readonly http: HttpClient) {}
  /** Attaches a repository. */ attachRepository(
    input: GitHubRepositoryAttachment,
    signal?: AbortSignal,
  ): Promise<GitHubRepositoryAttachment> {
    return this.http.request("/v1/integrations/github/repositories", {
      method: "POST",
      body: input,
      signal,
    });
  }
  /** Attaches a commit as evidence. */ attachCommit(
    input: Omit<GitHubEvidence, "type"> & { milestoneId: string },
    signal?: AbortSignal,
  ): Promise<GitHubEvidence> {
    return this.http.request("/v1/integrations/github/commits", {
      method: "POST",
      body: input,
      signal,
    });
  }
  /** Gets repository delivery activity. */ getDeliveryActivity(
    repository: string,
    signal?: AbortSignal,
  ): Promise<IntegrationActivity[]> {
    return this.http.request("/v1/integrations/github/activity", {
      query: { repository },
      signal,
    });
  }
}
