import { afterEach, describe, expect, it, vi } from "vitest";
import { CompositeLeadSink } from "./composite-lead-sink";
import {
  createLeadDeliverySinkFromEnv,
  resetLeadEmailSinkDisabledLogForTests,
} from "./composition";
import { EmailLeadSink } from "./email-lead-sink";
import type { LeadSink } from "./types";

const linearSink: LeadSink = { submit: vi.fn(async () => undefined) };

describe("createLeadDeliverySinkFromEnv", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    resetLeadEmailSinkDisabledLogForTests();
    vi.restoreAllMocks();
  });

  it("returns Linear only when Gmail env vars are missing", () => {
    delete process.env.GMAIL_SERVICE_ACCOUNT_JSON;
    delete process.env.GMAIL_SENDER;
    delete process.env.LEAD_EMAIL_TO;

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const sink = createLeadDeliverySinkFromEnv(linearSink);

    expect(sink).toBe(linearSink);
    expect(sink).not.toBeInstanceOf(CompositeLeadSink);
    expect(infoSpy).toHaveBeenCalledWith("lead_email_sink_disabled");
    infoSpy.mockRestore();
  });

  it("fans out to Linear and email when Gmail env vars are set", () => {
    process.env.GMAIL_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: "svc@project.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
    });
    process.env.GMAIL_SENDER = "diadem@didi.build";
    process.env.LEAD_EMAIL_TO = "hello@didi.build";

    const sink = createLeadDeliverySinkFromEnv(linearSink);
    expect(sink).toBeInstanceOf(CompositeLeadSink);
    expect(sink).not.toBe(linearSink);
  });

  it("logs lead_email_sink_disabled only once", () => {
    delete process.env.GMAIL_SERVICE_ACCOUNT_JSON;
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    createLeadDeliverySinkFromEnv(linearSink);
    createLeadDeliverySinkFromEnv(linearSink);

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith("lead_email_sink_disabled");
    infoSpy.mockRestore();
  });

  it("disables email when only some Gmail vars are set", () => {
    process.env.GMAIL_SENDER = "diadem@didi.build";
    delete process.env.GMAIL_SERVICE_ACCOUNT_JSON;
    delete process.env.LEAD_EMAIL_TO;

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const sink = createLeadDeliverySinkFromEnv(linearSink);

    expect(sink).toBe(linearSink);
    expect(sink).not.toBeInstanceOf(EmailLeadSink);
    infoSpy.mockRestore();
  });
});
