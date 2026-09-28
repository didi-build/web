"use client";

import { visibilityToolContent } from "@/content/visibility-tool";
import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@marsidev/react-turnstile";
import { useId, useState } from "react";
import type { VisibilityReport } from "@/lib/visibility/schemas";
import { submitVisibilityCheck } from "./visibility-check-api";
import { VisibilityCheckReport } from "./VisibilityCheckReport";

type Status = "idle" | "loading" | "error";

export function VisibilityCheckClient() {
  const copy = visibilityToolContent.page;
  const formId = useId();
  const [url, setUrl] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [report, setReport] = useState<VisibilityReport | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTurnstileError(undefined);
    setErrorMessage(undefined);

    if (!url.trim()) {
      setErrorMessage(copy.invalidUrl);
      return;
    }
    if (!turnstileToken) {
      setTurnstileError(copy.turnstileRequired);
      return;
    }

    setStatus("loading");
    const result = await submitVisibilityCheck({
      url: url.trim(),
      turnstileToken,
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.message);
      return;
    }

    setReport(result.report);
    setStatus("idle");
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 md:py-14">
      <header className="flex flex-col gap-3">
        <p className="m-0 text-sm font-medium uppercase tracking-wide text-ink-muted">
          {copy.eyebrow}
        </p>
        <h1 className="m-0 text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-semibold leading-tight text-ink">
          {copy.headline}
        </h1>
        <p className="m-0 text-base leading-relaxed text-ink-muted">{copy.intro}</p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {errorMessage && (
          <p
            role="alert"
            className="m-0 rounded-md border border-error bg-error-soft p-3 text-base text-ink"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor={`${formId}-url`} className="text-[15px] font-medium">
            {copy.urlLabel}
          </label>
          <input
            id={`${formId}-url`}
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder={copy.urlPlaceholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={status === "loading"}
            className="min-h-[52px] w-full rounded-md border border-line-strong bg-surface px-4 text-[17px] text-ink focus:border-accent focus:shadow-[0_0_0_2px_var(--accent)] focus:outline-none"
          />
        </div>

        <div
          id={`${formId}-turnstile`}
          role="group"
          aria-label={copy.spamProtectionLabel}
          className="max-w-full"
        >
          {siteKey ? (
            <Turnstile
              siteKey={siteKey}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
              options={{ theme: "auto", size: "flexible" }}
            />
          ) : (
            <p className="m-0 text-sm text-ink-muted">{siteContent.a11y.turnstileNotConfigured}</p>
          )}
          {turnstileError && (
            <p className="m-0 mt-2 text-[15px] font-medium text-error">{turnstileError}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={status === "loading"}
          className={`min-h-14 w-full sm:w-auto ${status === "loading" ? "opacity-70" : ""}`}
        >
          {status === "loading" ? copy.running : copy.submit}
        </Button>
      </form>

      {report && <VisibilityCheckReport report={report} />}
    </div>
  );
}
