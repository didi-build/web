export type HiCardLead = {
  name: string;
  email: string;
  phone?: string;
};

export type HiLeadDetails = {
  jobTitle?: string;
  company?: string;
  note?: string;
};

export type HiLinearIssueRef = {
  issueId: string;
  identifier: string;
  url: string;
};

export interface HiLinearSink {
  createCardLead(lead: HiCardLead): Promise<HiLinearIssueRef>;
  appendDetails(issueId: string, details: HiLeadDetails): Promise<void>;
  addIssueComment(issueId: string, body: string): Promise<void>;
  getIssueLeadNotificationContext(issueId: string): Promise<{
    identifier: string;
    url: string;
    leadName: string;
  }>;
}

export type HiRateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};
