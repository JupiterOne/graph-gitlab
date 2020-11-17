export interface GitlabIntegrationConfig {
  baseUrl: string;
  personalToken: string;

  /**
   * Used to limit number of ingested merge requests.
   */
  mergeRequestsUpdatedAfter?: Date;
}
