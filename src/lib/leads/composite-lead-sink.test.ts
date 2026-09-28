import { describe, expect, it, vi } from "vitest";
import { CompositeLeadSink } from "./composite-lead-sink";
import type { LeadRecord, LeadSink } from "./types";

const lead: LeadRecord = {
  name: "Sam",
  email: "sam@example.com",
  message: "Hello",
};

function makeSink(submit: LeadSink["submit"]): LeadSink {
  return { submit };
}

describe("CompositeLeadSink", () => {
  it("calls every sink with the visibility report", async () => {
    const linear = vi.fn(async () => undefined);
    const email = vi.fn(async () => undefined);
    const sink = new CompositeLeadSink([
      { name: "linear", sink: makeSink(linear) },
      { name: "email", sink: makeSink(email) },
    ]);

    await sink.submit(lead, null, null);

    expect(linear).toHaveBeenCalledOnce();
    expect(email).toHaveBeenCalledOnce();
  });

  it("succeeds when one sink fails", async () => {
    const sink = new CompositeLeadSink([
      {
        name: "linear",
        sink: makeSink(async () => {
          throw new Error("linear down");
        }),
      },
      { name: "email", sink: makeSink(async () => undefined) },
    ]);

    await expect(sink.submit(lead, null, null)).resolves.toBeUndefined();
  });

  it("throws when all sinks fail", async () => {
    const sink = new CompositeLeadSink([
      {
        name: "linear",
        sink: makeSink(async () => {
          throw new Error("linear down");
        }),
      },
      {
        name: "email",
        sink: makeSink(async () => {
          throw new Error("email down");
        }),
      },
    ]);

    await expect(sink.submit(lead, null, null)).rejects.toThrow("all_lead_sinks_failed");
  });
});
