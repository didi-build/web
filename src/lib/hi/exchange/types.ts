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

export interface HiLinearSink {
  createCardLead(lead: HiCardLead): Promise<{ issueId: string }>;
  appendDetails(issueId: string, details: HiLeadDetails): Promise<void>;
  addIssueComment(issueId: string, body: string): Promise<void>;
}

export type HiRateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};
