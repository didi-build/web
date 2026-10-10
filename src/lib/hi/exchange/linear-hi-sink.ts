import {
  formatHiCardLinearDetailsComment,
  formatHiCardLinearIssueDescription,
  formatHiCardLinearIssueTitle,
} from "./format-linear-card-issue";
import { parseLeadNameFromLinearIssueTitle } from "./format-linear-card-issue";
import type { HiCardLead, HiLeadDetails, HiLinearIssueRef, HiLinearSink } from "./types";

const LINEAR_API = "https://api.linear.app/graphql";

const ISSUE_CREATE = `
mutation IssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue { id identifier url }
  }
}
`;

const ISSUE_LEAD_CONTEXT = `
query IssueLeadContext($id: String!) {
  issue(id: $id) {
    identifier
    url
    title
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

  async createCardLead(lead: HiCardLead): Promise<HiLinearIssueRef> {
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
      data?: {
        issueCreate?: {
          success?: boolean;
          issue?: { id?: string; identifier?: string; url?: string };
        };
      };
      errors?: unknown[];
    };

    const issue = payload.data?.issueCreate?.issue;
    const issueId = issue?.id;
    const identifier = issue?.identifier;
    const url = issue?.url;
    if (
      payload.errors?.length ||
      !payload.data?.issueCreate?.success ||
      !issueId ||
      !identifier ||
      !url
    ) {
      throw new Error("linear_issue_create_failed");
    }

    return { issueId, identifier, url };
  }

  async getIssueLeadNotificationContext(issueId: string): Promise<{
    identifier: string;
    url: string;
    leadName: string;
  }> {
    const response = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: this.config.apiKey,
      },
      body: JSON.stringify({
        query: ISSUE_LEAD_CONTEXT,
        variables: { id: issueId },
      }),
    });

    if (!response.ok) {
      throw new Error(`linear_http_${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: { issue?: { identifier?: string; url?: string; title?: string } };
      errors?: unknown[];
    };

    const issue = payload.data?.issue;
    const identifier = issue?.identifier;
    const url = issue?.url;
    const title = issue?.title ?? "";
    const leadName = parseLeadNameFromLinearIssueTitle(title);
    if (payload.errors?.length || !identifier || !url || !leadName) {
      throw new Error("linear_issue_lookup_failed");
    }

    return { identifier, url, leadName };
  }

  async appendDetails(issueId: string, details: HiLeadDetails): Promise<void> {
    await this.addIssueComment(issueId, formatHiCardLinearDetailsComment(details));
  }

  async addIssueComment(issueId: string, body: string): Promise<void> {
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
            body,
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
