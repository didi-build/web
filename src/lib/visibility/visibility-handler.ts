import { NextResponse } from "next/server";
import { processVisibilityCheck, type VisibilityPipelineDeps } from "./process-visibility-check";

export function createVisibilityCheckHandler(getDeps: () => VisibilityPipelineDeps) {
  return async function handleVisibilityCheckRequest(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request. Please try again." }, { status: 400 });
    }

    let deps: VisibilityPipelineDeps;
    try {
      deps = getDeps();
    } catch (error) {
      console.error(
        "visibility_pipeline_config_error",
        error instanceof Error ? error.message : "unknown",
      );
      return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 500 });
    }

    const result = await processVisibilityCheck(body, deps);

    if (result.status === 200) {
      return NextResponse.json(result.report, { status: 200 });
    }

    return NextResponse.json({ error: result.message }, { status: result.status });
  };
}
