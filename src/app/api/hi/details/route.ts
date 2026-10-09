import { createHiDetailsDepsFromEnv } from "@/lib/hi/exchange/composition";
import { createHiDetailsHandler } from "@/lib/hi/exchange/hi-api-handler";

export const POST = createHiDetailsHandler(createHiDetailsDepsFromEnv);
