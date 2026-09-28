import type { VisibilityReport } from "@/lib/visibility/schemas";

export type VisibilityCheckRequest = {
  url: string;
  turnstileToken: string;
};

export type VisibilityCheckErrorResponse = {
  error: string;
};

export async function submitVisibilityCheck(
  payload: VisibilityCheckRequest,
): Promise<{ ok: true; report: VisibilityReport } | { ok: false; message: string }> {
  const response = await fetch("/api/visibility-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  if (!response.ok) {
    const err = data as VisibilityCheckErrorResponse;
    return {
      ok: false,
      message: err.error ?? "Something went wrong. Please try again.",
    };
  }

  return { ok: true, report: data as VisibilityReport };
}
