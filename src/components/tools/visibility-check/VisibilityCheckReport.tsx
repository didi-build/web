import { visibilityToolContent } from "@/content/visibility-tool";
import type { VisibilityReport } from "@/lib/visibility/schemas";

const copy = visibilityToolContent.page.report;

export function VisibilityCheckReport({ report }: { report: VisibilityReport }) {
  return (
    <div className="flex flex-col gap-8">
      {typeof report.score === "number" && (
        <p className="m-0 text-lg font-semibold text-ink">
          {copy.scoreLabel}: {report.score}/100
        </p>
      )}

      <section aria-labelledby="visibility-summary">
        <h2 id="visibility-summary" className="m-0 text-xl font-semibold">
          {copy.summaryHeading}
        </h2>
        <p className="mb-0 mt-3 text-base leading-relaxed text-ink">{report.summary}</p>
      </section>

      <section aria-labelledby="visibility-fixes">
        <h2 id="visibility-fixes" className="m-0 text-xl font-semibold">
          {copy.fixesHeading}
        </h2>
        <ol className="mb-0 mt-3 list-decimal space-y-2 pl-5 text-base text-ink">
          {report.topFixes.map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="visibility-findings">
        <h2 id="visibility-findings" className="m-0 text-xl font-semibold">
          {copy.findingsHeading}
        </h2>
        <ul className="mb-0 mt-4 flex list-none flex-col gap-4 p-0">
          {report.findings.map((finding) => (
            <li key={finding.id} className="rounded-md border border-line-strong bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="m-0 text-base font-semibold text-ink">{finding.label}</h3>
                <StatusBadge status={finding.status} />
              </div>
              <p className="mb-0 mt-2 text-base text-ink">{finding.detail}</p>
              <p className="mb-0 mt-3 text-sm text-ink-muted">
                <span className="font-medium text-ink">{copy.whyHeading}: </span>
                {finding.whyItMatters}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const label = copy.statusLabels[status];
  const className =
    status === "pass"
      ? "bg-accent-soft text-ink"
      : status === "warn"
        ? "bg-surface-2 text-ink"
        : "bg-error-soft text-error";
  return (
    <span className={`rounded-pill px-2.5 py-0.5 text-sm font-medium ${className}`}>{label}</span>
  );
}
