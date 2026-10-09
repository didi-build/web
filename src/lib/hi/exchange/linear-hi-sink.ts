import {
  formatHiCardLinearDetailsComment,
  formatHiCardLinearIssueDescription,
  formatHiCardLinearIssueTitle,
} from "./format-linear-card-issue";
import type { HiCardLead, HiLeadDetails, HiLinearSink } from "./types";

const LINEAR_API = "https://api.linear.app/graphql";

const ISSUE_CREATE = `
mutation IssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue { id }
  }
}
`;

const COMMENT_CREATE = `
mutation CommentCreate($input: CommentCreateInput!) {
  commentCreate(input: $input) {
    success
  }
}
`;

export type LinearHiSinkConfig = {
  apiKey: string;
  teamId: string;
  projectId: string;
  leadLabelId: string;
};

export class LinearHiSink implements HiLinearSink {
  constructor(private readonly config: LinearHiSinkConfig) {}

  async createCardLead(lead: HiCardLead): Promise<{ issueId: string }> {
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
            title: formatHiCardLinearIssueTitle(lead),
            description: formatHiCardLinearIssueDescription(lead),
            labelIds: [this.config.leadLabelId],
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`linear_http_${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { issueCreate?: { success?: boolean; issue?: { id?: string } } };
      errors?: unknown[];
    };

    const issueId = payload.data?.issueCreate?.issue?.id;
    if (payload.errors?.length || !payload.data?.issueCreate?.success || !issueId) {
      throw new Error("linear_issue_create_failed");
    }

    return { issueId };
  }

  async appendDetails(issueId: string, details: HiLeadDetails): Promise<void> {
    const response = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: this.config.apiKey,
      },
      body: JSON.stringify({
        query: COMMENT_CREATE,
        variables: {
          input: {
            issueId,
            body: formatHiCardLinearDetailsComment(details),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`linear_http_${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { commentCreate?: { success?: boolean } };
      errors?: unknown[];
    };

    if (payload.errors?.length || !payload.data?.commentCreate?.success) {
      throw new Error("linear_comment_create_failed");
    }
  }
}
