import { formatLinearIssueDescription, formatLinearIssueTitle } from "./format-linear-issue";
import type { LeadRecord, LeadSink, LeadSummary } from "./types";

const LINEAR_API = "https://api.linear.app/graphql";

const ISSUE_CREATE = `
mutation IssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue { id }
  }
}
`;

export type LinearLeadSinkConfig = {
  apiKey: string;
  teamId: string;
  projectId: string;
  leadLabelId: string;
};

export class LinearLeadSink implements LeadSink {
  constructor(private readonly config: LinearLeadSinkConfig) {}

  async submit(lead: LeadRecord, summary: LeadSummary | null): Promise<void> {
    const response = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: this.config.apiKey,
      },
      body: JSON.stringify({
        query: ISSUE_CREATE,
        variables: {
          input: {
            teamId: this.config.teamId,
            projectId: this.config.projectId,
            title: formatLinearIssueTitle(lead),
            description: formatLinearIssueDescription(lead, summary),
            labelIds: [this.config.leadLabelId],
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`linear_http_${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { issueCreate?: { success?: boolean } };
      errors?: unknown[];
    };

    if (payload.errors?.length || !payload.data?.issueCreate?.success) {
      throw new Error("linear_issue_create_failed");
    }
  }
}
