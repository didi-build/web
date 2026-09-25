import { createLeadPipelineFromEnv } from "@/lib/leads/composition";
import { createLeadsHandler } from "@/lib/leads/leads-handler";

export const POST = createLeadsHandler(createLeadPipelineFromEnv);
