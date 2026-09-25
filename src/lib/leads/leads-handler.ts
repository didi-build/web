import { processLeadSubmission, type LeadPipelineDeps } from "./process-lead";
import { NextResponse } from "next/server";

export function createLeadsHandler(getDeps: () => LeadPipelineDeps) {
  return async function handleLeadsRequest(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    let deps: LeadPipelineDeps;
    try {
      deps = getDeps();
    } catch (error) {
      console.error(
        "lead_pipeline_config_error",
        error instanceof Error ? error.message : "unknown",
      );
      return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 500 });
    }

    const result = await processLeadSubmission(body, deps);

    if (result.status === 201) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    return NextResponse.json({ error: result.message }, { status: result.status });
  };
}
