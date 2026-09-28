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
    const results = await Promise.allSettled(
      this.sinks.map(({ sink }) => sink.submit(lead, summary, visibilityReport)),
    );

    const failures: { name: string; error: unknown }[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        const { name } = this.sinks[i];
        console.error(
          "lead_sink_partial_failure",
          name,
          result.reason instanceof Error ? result.reason.message : "unknown",
        );
        failures.push({ name, error: result.reason });
      }
    }

    if (failures.length === this.sinks.length && this.sinks.length > 0) {
      throw new Error("all_lead_sinks_failed");
    }
  }
}
