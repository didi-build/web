import { createHiExchangeDepsFromEnv } from "@/lib/hi/exchange/composition";
import { createHiExchangeHandler } from "@/lib/hi/exchange/hi-api-handler";

export const POST = createHiExchangeHandler(createHiExchangeDepsFromEnv);
