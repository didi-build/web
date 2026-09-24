export type LeadInput = {
  name: string;
  email: string;
  businessName?: string;
  website?: string;
  message: string;
  turnstileToken: string;
};

export type LeadSummary = {
  summary: string;
  needs: string[];
  suggestedPattern: string;
  urgency: "low" | "medium" | "high";
  followUpQuestions: string[];
};

export type LeadRecord = Omit<LeadInput, "turnstileToken">;

export interface LeadSummarizer {
  summarize(lead: LeadRecord): Promise<LeadSummary>;
}

export interface LeadSink {
  submit(lead: LeadRecord, summary: LeadSummary | null): Promise<void>;
}
