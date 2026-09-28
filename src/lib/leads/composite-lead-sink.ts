import type { LeadRecord, LeadSink, LeadSummary } from "./types";
import type { VisibilityReport } from "../visibility/types";

export type NamedLeadSink = {
  name: string;
  sink: LeadSink;
};

export class CompositeLeadSink implements LeadSink {
  constructor(private readonly sinks: NamedLeadSink[]) {}

  async submit(
    lead: LeadRecord,
    summary: LeadSummary | null,
    visibilityReport: VisibilityReport | null,
  ): Promise<void> {
    const failures: { name: string; error: unknown }[] = [];

    for (const { name, sink } of this.sinks) {
      try {
        await sink.submit(lead, summary, visibilityReport);
      } catch (error) {
        console.error(
          "lead_sink_partial_failure",
          name,
          error instanceof Error ? error.message : "unknown",
        );
        failures.push({ name, error });
      }
    }

    if (failures.length === this.sinks.length && this.sinks.length > 0) {
      throw new Error("all_lead_sinks_failed");
    }
  }
}
