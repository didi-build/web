import { getLeadPipelineDeps } from "@/lib/leads/composition";
import { processLeadSubmission } from "@/lib/leads/process-lead";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const deps = getLeadPipelineDeps();
  const result = await processLeadSubmission(body, deps);

  if (result.status === 201) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ error: result.message }, { status: result.status });
}
