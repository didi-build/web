import { NextResponse } from "next/server";
import type { HiExchangeDeps, HiExchangeResult } from "./process-exchange";
import { processHiExchange } from "./process-exchange";
import type { HiDetailsDeps, HiDetailsResult } from "./process-details";
import { processHiDetails } from "./process-details";

export function createHiExchangeHandler(getDeps: () => HiExchangeDeps) {
  return async function handleHiExchangeRequest(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request. Please try again." }, { status: 400 });
    }

    let deps: HiExchangeDeps;
    try {
      deps = getDeps();
    } catch (error) {
      console.error("hi_exchange_config_error", error instanceof Error ? error.message : "unknown");
      return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 500 });
    }

    const result: HiExchangeResult = await processHiExchange(body, request, deps);

    if (result.status === 200) {
      return NextResponse.json({ ok: true, token: result.token }, { status: 200 });
    }

    return NextResponse.json({ error: result.message }, { status: result.status });
  };
}

export function createHiDetailsHandler(getDeps: () => HiDetailsDeps) {
  return async function handleHiDetailsRequest(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request. Please try again." }, { status: 400 });
    }

    let deps: HiDetailsDeps;
    try {
      deps = getDeps();
    } catch (error) {
      console.error("hi_details_config_error", error instanceof Error ? error.message : "unknown");
      return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 500 });
    }

    const result: HiDetailsResult = await processHiDetails(body, deps);

    if (result.status === 200) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ error: result.message }, { status: result.status });
  };
}
